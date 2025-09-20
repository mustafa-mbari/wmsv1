import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import logger from '../../../utils/logger/logger';
import prisma from '../../../utils/prismaClient';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role_names: string[];
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  role_names: string[];
  iat?: number;
  exp?: number;
}

// JWT secret - in production, this should be from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

// Authentication middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Authentication failed: missing or invalid authorization header', { 
        source: 'authMiddleware', 
        method: 'authenticateToken',
        url: req.originalUrl
      });
      return res.status(HttpStatus.UNAUTHORIZED).json(
        createApiResponse(false, null, 'Authorization token required')
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    let payload: JWTPayload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      logger.warn('Authentication failed: invalid or expired token', { 
        source: 'authMiddleware', 
        method: 'authenticateToken',
        url: req.originalUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return res.status(HttpStatus.UNAUTHORIZED).json(
        createApiResponse(false, null, 'Invalid or expired token')
      );
    }

    // Verify user still exists and is active
    const user = await prisma.users.findUnique({
      where: { id: parseInt(payload.id) },
      include: {
        user_roles_user_roles_user_idTousers: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!user || !user.is_active) {
      logger.warn('Authentication failed: user not found or inactive', { 
        source: 'authMiddleware', 
        method: 'authenticateToken',
        userId: payload.id.toString(),
        url: req.originalUrl
      });
      return res.status(HttpStatus.UNAUTHORIZED).json(
        createApiResponse(false, null, 'User not found or inactive')
      );
    }

    // Update last login timestamp
    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date() }
    });

    // Add user info to request object
    req.user = {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      role_names: user.user_roles_user_roles_user_idTousers.map(ur => ur.roles.slug)
    };

    logger.info('Authentication successful', { 
      source: 'authMiddleware', 
      method: 'authenticateToken',
      userId: user.id.toString(),
      url: req.originalUrl
    });

    next();
  } catch (error) {
    logger.error('Authentication middleware error', { 
      source: 'authMiddleware', 
      method: 'authenticateToken',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      url: req.originalUrl
    });
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      createApiResponse(false, null, 'Authentication server error')
    );
  }
};

// Role-based access control middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HttpStatus.UNAUTHORIZED).json(
        createApiResponse(false, null, 'Authentication required')
      );
    }

    const userRoles = req.user.role_names.map(role => role.toLowerCase());
    const requiredRoles = roles.map(role => role.toLowerCase());
    
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      logger.warn('Authorization failed: insufficient permissions', { 
        source: 'authMiddleware', 
        method: 'requireRole',
        userId: req.user.id,
        userRoles,
        requiredRoles,
        url: req.originalUrl
      });
      return res.status(HttpStatus.FORBIDDEN).json(
        createApiResponse(false, null, 'Insufficient permissions')
      );
    }

    next();
  };
};

// Check if user is admin
export const requireAdmin = requireRole(['admin', 'super-admin']);

// Check if user is super admin
export const requireSuperAdmin = requireRole(['super-admin']);