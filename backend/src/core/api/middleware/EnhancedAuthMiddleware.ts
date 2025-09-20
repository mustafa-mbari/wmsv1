import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'inversify';
import jwt from 'jsonwebtoken';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { EntityId } from '../../domain/valueObjects/common/EntityId';

// Enhanced User interface for request
export interface AuthenticatedUser {
  id: EntityId;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  lastLoginAt: Date;
}

// JWT Payload interface
export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      correlationId?: string;
    }
  }
}

// Token service interface for dependency injection
export interface ITokenService {
  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
  verifyToken(token: string): JWTPayload;
  refreshToken(token: string): string;
}

// User service interface for dependency injection
export interface IUserService {
  getUserById(id: EntityId): Promise<AuthenticatedUser | null>;
  updateLastLogin(id: EntityId): Promise<void>;
  hasPermission(userId: EntityId, permission: string): Promise<boolean>;
  hasRole(userId: EntityId, role: string): Promise<boolean>;
}

@injectable()
export class TokenService implements ITokenService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    if (!process.env.JWT_SECRET) {
      console.warn('⚠️  JWT_SECRET not set in environment variables. Using default (not secure for production)');
    }
  }

  generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'wms-api',
      audience: 'wms-client'
    });
  }

  verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.jwtSecret, {
      issuer: 'wms-api',
      audience: 'wms-client'
    }) as JWTPayload;
  }

  refreshToken(refreshToken: string): string {
    const payload = jwt.verify(refreshToken, this.jwtSecret) as JWTPayload;

    // Create new token with fresh expiration
    const newPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
      id: payload.id,
      email: payload.email,
      username: payload.username,
      roles: payload.roles,
      permissions: payload.permissions
    };

    return this.generateToken(newPayload);
  }
}

@injectable()
export class EnhancedAuthMiddleware {
  constructor(
    @inject('ITokenService') private tokenService: ITokenService,
    @inject('IUserService') private userService: IUserService
  ) {}

  /**
   * Authentication middleware - validates JWT token and loads user
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);

      if (!token) {
        this.sendUnauthorized(res, 'Authorization token required');
        return;
      }

      // Verify and decode token
      let payload: JWTPayload;
      try {
        payload = this.tokenService.verifyToken(token);
      } catch (error) {
        this.sendUnauthorized(res, 'Invalid or expired token');
        return;
      }

      // Load user from database
      const userId = EntityId.fromString(payload.id);
      const user = await this.userService.getUserById(userId);

      if (!user || !user.isActive) {
        this.sendUnauthorized(res, 'User not found or inactive');
        return;
      }

      // Update last login (async, don't wait)
      this.userService.updateLastLogin(userId).catch(console.error);

      // Attach user to request
      req.user = user;
      req.correlationId = this.generateCorrelationId();

      next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      this.sendServerError(res, 'Authentication server error');
    }
  };

  /**
   * Authorization middleware - checks if user has required roles
   */
  requireRoles = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        this.sendUnauthorized(res, 'Authentication required');
        return;
      }

      const userRoles = req.user.roles.map(role => role.toLowerCase());
      const requiredRoles = roles.map(role => role.toLowerCase());

      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        this.sendForbidden(res, 'Insufficient role permissions', {
          userRoles,
          requiredRoles
        });
        return;
      }

      next();
    };
  };

  /**
   * Permission-based authorization middleware
   */
  requirePermissions = (permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        this.sendUnauthorized(res, 'Authentication required');
        return;
      }

      try {
        const userPermissions = req.user.permissions.map(p => p.toLowerCase());
        const requiredPermissions = permissions.map(p => p.toLowerCase());

        const hasAllPermissions = requiredPermissions.every(permission =>
          userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
          this.sendForbidden(res, 'Insufficient permissions', {
            userPermissions,
            requiredPermissions
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Permission check error:', error);
        this.sendServerError(res, 'Authorization server error');
      }
    };
  };

  /**
   * Admin role shortcut
   */
  requireAdmin = this.requireRoles(['admin', 'super-admin']);

  /**
   * Super admin role shortcut
   */
  requireSuperAdmin = this.requireRoles(['super-admin']);

  /**
   * Optional authentication - loads user if token present but doesn't fail if missing
   */
  optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);

      if (!token) {
        next();
        return;
      }

      try {
        const payload = this.tokenService.verifyToken(token);
        const userId = EntityId.fromString(payload.id);
        const user = await this.userService.getUserById(userId);

        if (user && user.isActive) {
          req.user = user;
          req.correlationId = this.generateCorrelationId();
        }
      } catch {
        // Token invalid, but continue without user
      }

      next();
    } catch (error) {
      console.error('Optional auth middleware error:', error);
      next(); // Continue even on error for optional auth
    }
  };

  /**
   * Rate limiting by user
   */
  rateLimit = (maxRequests: number, windowMs: number) => {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction): void => {
      const userId = req.user?.id.value || req.ip;
      const now = Date.now();
      const userRequests = requests.get(userId);

      if (!userRequests || now > userRequests.resetTime) {
        requests.set(userId, { count: 1, resetTime: now + windowMs });
        next();
        return;
      }

      if (userRequests.count >= maxRequests) {
        res.status(HttpStatus.TOO_MANY_REQUESTS).json(
          createApiResponse(false, null, 'Rate limit exceeded', {
            retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
          })
        );
        return;
      }

      userRequests.count++;
      next();
    };
  };

  // Private helper methods
  private extractToken(req: Request): string | null {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookie (for web UI)
    if (req.cookies && req.cookies.accessToken) {
      return req.cookies.accessToken;
    }

    return null;
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendUnauthorized(res: Response, message: string): void {
    res.status(HttpStatus.UNAUTHORIZED).json(
      createApiResponse(false, null, message)
    );
  }

  private sendForbidden(res: Response, message: string, context?: any): void {
    res.status(HttpStatus.FORBIDDEN).json(
      createApiResponse(false, null, message, context)
    );
  }

  private sendServerError(res: Response, message: string): void {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, message)
    );
  }
}