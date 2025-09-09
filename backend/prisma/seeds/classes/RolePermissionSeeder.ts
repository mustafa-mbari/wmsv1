// prisma/seeds/classes/RolePermissionSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';
import logger from '../../../src/utils/logger/logger';

export interface RolePermissionSeedData {
  role_slug: string;
  permissions: string[];
}

export class RolePermissionSeeder extends BaseSeed<RolePermissionSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'role_permissions';
  }

  getJsonFileName(): string {
    return 'role-permissions.json';
  }

  getDependencies(): string[] {
    return ['roles', 'permissions']; // Must run after roles and permissions
  }

  validateRecord(record: RolePermissionSeedData): boolean {
    // Required fields validation
    if (!record.role_slug || !record.permissions || !Array.isArray(record.permissions)) {
      logger.error('RolePermission record missing required fields', { source: 'RolePermissionSeeder', method: 'validateRecord', record });
      return false;
    }

    // Check if permissions array has items
    if (record.permissions.length === 0) {
      logger.warn('RolePermission record has empty permissions array', { source: 'RolePermissionSeeder', method: 'validateRecord', role_slug: record.role_slug });
      return false;
    }

    return true;
  }

  async transformRecord(record: RolePermissionSeedData): Promise<any[]> {
    try {
      const role = await this.prisma.roles.findUnique({
        where: { slug: record.role_slug.toLowerCase() }
      });

      if (!role) {
        logger.error(`Role '${record.role_slug}' not found`, { source: 'RolePermissionSeeder', method: 'transformRecord', role_slug: record.role_slug });
        console.error(`[RolePermissionSeeder]: Role '${record.role_slug}' not found`);
        return [];
      }

      const rolePermissions: any[] = [];

      for (const permissionSlug of record.permissions) {
        const permission = await this.prisma.permissions.findUnique({
          where: { slug: permissionSlug.toLowerCase() }
        });

        if (!permission) {
          logger.warn(`Permission '${permissionSlug}' not found for role '${record.role_slug}'`, { source: 'RolePermissionSeeder', method: 'transformRecord', permission_slug: permissionSlug, role_slug: record.role_slug });
          console.warn(`[RolePermissionSeeder]: Permission '${permissionSlug}' not found for role '${record.role_slug}'`);
          continue;
        }

        rolePermissions.push({
          role_id: role.id,
          permission_id: permission.id
        });
      }

      return rolePermissions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error in transformRecord for role '${record.role_slug}': ${errorMessage}`, { source: 'RolePermissionSeeder', method: 'transformRecord', record, error: errorMessage });
      console.error(`[RolePermissionSeeder]: Error in transformRecord for role '${record.role_slug}':`, errorMessage);
      throw error;
    }
  }

  async findExistingRecord(record: RolePermissionSeedData): Promise<any> {
    // For this seeder, we check if the role already has all its permissions assigned
    const role = await this.prisma.roles.findUnique({
      where: { slug: record.role_slug.toLowerCase() }
    });

    if (!role) return null;

    const existingPermissions = await this.prisma.role_permissions.findMany({
      where: { role_id: role.id },
      include: {
        permissions: true
      }
    });

    // Return the role if it already has some permissions assigned
    return existingPermissions.length > 0 ? { id: role.id, permissions: existingPermissions } : null;
  }

  // Override the processBatch method for specialized handling
  protected async processBatch(batch: RolePermissionSeedData[]): Promise<any> {
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

        // Transform record to get role-permission pairs
        const rolePermissions = await this.transformRecord(record);
        
        if (rolePermissions.length === 0) {
          result.recordsSkipped++;
          continue;
        }

        // Check if we should force update
        const existingData = await this.findExistingRecord(record);
        
        if (existingData && !this.options.force) {
          result.recordsSkipped++;
          logger.info(`Role permissions for '${record.role_slug}' already exist, skipping`, { source: 'RolePermissionSeeder', role_slug: record.role_slug });
          continue;
        }

        // If force update, delete existing permissions for this role
        if (existingData && this.options.force) {
          await this.prisma.role_permissions.deleteMany({
            where: { role_id: existingData.id }
          });
          logger.info(`Deleted existing permissions for role '${record.role_slug}'`, { source: 'RolePermissionSeeder', role_slug: record.role_slug });
        }

        // Create new role permissions
        for (const rolePermission of rolePermissions) {
          const existingRolePermission = await this.prisma.role_permissions.findFirst({
            where: {
              role_id: rolePermission.role_id,
              permission_id: rolePermission.permission_id
            }
          });

          if (!existingRolePermission) {
            await this.prisma.role_permissions.create({
              data: {
                ...rolePermission,
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

        logger.info(`Processed permissions for role '${record.role_slug}'`, { 
          source: 'RolePermissionSeeder', 
          role_slug: record.role_slug, 
          permissions_count: rolePermissions.length 
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push(`Error processing record for role '${record.role_slug}': ${errorMessage}`);
        result.success = false;
        logger.error('Error processing role permission record', { 
          source: 'RolePermissionSeeder', 
          method: 'processBatch',
          record, 
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined
        });
        console.error(`[RolePermissionSeeder]: Error processing role permission record for '${record.role_slug}':`, errorMessage);
      }
    }

    return result;
  }

  // Helper method to get role permissions
  async getRolePermissions(roleSlug: string) {
    return await this.safeExecute(async () => {
      return await this.prisma.role_permissions.findMany({
        where: {
          roles: { slug: roleSlug }
        },
        include: {
          roles: true,
          permissions: true
        }
      });
    });
  }
}