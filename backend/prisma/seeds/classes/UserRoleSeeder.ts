// prisma/seeds/classes/UserRoleSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';
import logger from '../../../src/utils/logger/logger';

export interface UserRoleSeedData {
  username: string;
  role_slugs: string[];
}

export class UserRoleSeeder extends BaseSeed<UserRoleSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'user_roles';
  }

  getJsonFileName(): string {
    return 'user-roles.json';
  }

  getDependencies(): string[] {
    return ['users', 'roles']; // Must run after users and roles
  }

  validateRecord(record: UserRoleSeedData): boolean {
    // Required fields validation
    if (!record.username || !record.role_slugs || !Array.isArray(record.role_slugs)) {
      logger.error('UserRole record missing required fields', { source: 'UserRoleSeeder', method: 'validateRecord', record });
      return false;
    }

    // Check if role_slugs array has items
    if (record.role_slugs.length === 0) {
      logger.warn('UserRole record has empty role_slugs array', { source: 'UserRoleSeeder', method: 'validateRecord', username: record.username });
      return false;
    }

    return true;
  }

  async transformRecord(record: UserRoleSeedData): Promise<any[]> {
    const user = await this.prisma.users.findUnique({
      where: { username: record.username.toLowerCase() }
    });

    if (!user) {
      logger.error(`User '${record.username}' not found`, { source: 'UserRoleSeeder', method: 'transformRecord', username: record.username });
      return [];
    }

    const userRoles: any[] = [];

    for (const roleSlug of record.role_slugs) {
      const role = await this.prisma.roles.findUnique({
        where: { slug: roleSlug.toLowerCase() }
      });

      if (!role) {
        logger.warn(`Role '${roleSlug}' not found for user '${record.username}'`, { source: 'UserRoleSeeder', method: 'transformRecord', role_slug: roleSlug, username: record.username });
        continue;
      }

      userRoles.push({
        user_id: user.id,
        role_id: role.id,
        assigned_by: this.options.systemUserId || 1 // System user or fallback
      });
    }

    return userRoles;
  }

  async findExistingRecord(record: UserRoleSeedData): Promise<any> {
    // For this seeder, we check if the user already has roles assigned
    const user = await this.prisma.users.findUnique({
      where: { username: record.username.toLowerCase() }
    });

    if (!user) return null;

    const existingRoles = await this.prisma.user_roles.findMany({
      where: { user_id: user.id },
      include: {
        roles: true
      }
    });

    // Return the user if they already have some roles assigned
    return existingRoles.length > 0 ? { id: user.id, roles: existingRoles } : null;
  }

  // Override the processBatch method for specialized handling
  protected async processBatch(batch: UserRoleSeedData[]): Promise<any> {
    const result = {
      success: true,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      duration: 0
    };

    for (const record of batch) {
      try {
        result.recordsProcessed++;

        // Validate record
        if (this.options.validate && !this.validateRecord(record)) {
          result.recordsSkipped++;
          result.errors.push(`Invalid record: ${JSON.stringify(record)}`);
          continue;
        }

        // Transform record to get user-role pairs
        const userRoles = await this.transformRecord(record);
        
        if (userRoles.length === 0) {
          result.recordsSkipped++;
          continue;
        }

        // Check if we should force update
        const existingData = await this.findExistingRecord(record);
        
        if (existingData && !this.options.force) {
          result.recordsSkipped++;
          logger.info(`User roles for '${record.username}' already exist, skipping`, { source: 'UserRoleSeeder', username: record.username });
          continue;
        }

        // If force update, delete existing roles for this user
        if (existingData && this.options.force) {
          await this.prisma.user_roles.deleteMany({
            where: { user_id: existingData.id }
          });
          logger.info(`Deleted existing roles for user '${record.username}'`, { source: 'UserRoleSeeder', username: record.username });
        }

        // Create new user roles
        for (const userRole of userRoles) {
          const existingUserRole = await this.prisma.user_roles.findFirst({
            where: {
              user_id: userRole.user_id,
              role_id: userRole.role_id
            }
          });

          if (!existingUserRole) {
            await this.prisma.user_roles.create({
              data: {
                ...userRole,
                assigned_at: new Date(),
                created_by: this.options.systemUserId,
                updated_by: this.options.systemUserId,
                created_at: new Date(),
                updated_at: new Date()
              }
            });
            result.recordsCreated++;
          } else {
            result.recordsSkipped++;
          }
        }

        logger.info(`Processed roles for user '${record.username}'`, { 
          source: 'UserRoleSeeder', 
          username: record.username, 
          roles_count: userRoles.length 
        });

      } catch (error) {
        result.errors.push(`Error processing record: ${error}`);
        result.success = false;
        logger.error('Error processing user role record', { source: 'UserRoleSeeder', record, error: error instanceof Error ? error.message : error });
      }
    }

    return result;
  }

  // Helper method to get user roles
  async getUserRoles(username: string) {
    return await this.safeExecute(async () => {
      return await this.prisma.user_roles.findMany({
        where: {
          users_user_roles_user_idTousers: { username: username.toLowerCase() }
        },
        include: {
          users_user_roles_user_idTousers: true,
          roles: true
        }
      });
    });
  }

  // Helper method to get user with all their roles and permissions
  async getUserWithRolesAndPermissions(username: string) {
    return await this.safeExecute(async () => {
      return await this.prisma.users.findUnique({
        where: { username: username.toLowerCase() },
        include: {
          user_roles: {
            include: {
              roles: {
                include: {
                  role_permissions: {
                    include: {
                      permissions: true
                    }
                  }
                }
              }
            }
          }
        }
      });
    });
  }
}