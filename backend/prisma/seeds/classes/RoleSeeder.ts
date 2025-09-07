// prisma/seeds/classes/RoleSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';

export interface RoleSeedData {
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
  permissions?: string[]; // Permission slugs to assign
}

export class RoleSeeder extends BaseSeed<RoleSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'roles';
  }

  getJsonFileName(): string {
    return 'roles.json';
  }

  getDependencies(): string[] {
    return ['permissions']; // Roles depend on permissions being seeded first
  }

  validateRecord(record: RoleSeedData): boolean {
    // Required fields validation
    if (!record.name || !record.slug) {
      console.error('Role record missing required fields:', record);
      return false;
    }

    // Slug format validation
    const slugRegex = /^[a-z0-9_-]+$/;
    if (!slugRegex.test(record.slug)) {
      console.error('Invalid role slug format (use lowercase, numbers, _ or -):', record.slug);
      return false;
    }

    // Name length validation
    if (record.name.length > 100) {
      console.error('Role name too long (max 100 characters):', record.name);
      return false;
    }

    return true;
  }

  transformRecord(record: RoleSeedData): any {
    return {
      name: record.name.trim(),
      slug: record.slug.toLowerCase().trim(),
      description: record.description?.trim() || null,
      is_active: record.is_active !== false // Default to true
    };
  }

  async findExistingRecord(record: RoleSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: {
          OR: [
            { slug: record.slug.toLowerCase() },
            { name: record.name }
          ]
        }
      });
    });
  }

  // Override seed method to handle permission assignments
  async seed() {
    const result = await super.seed();
    
    if (result.success && (result.recordsCreated > 0 || result.recordsUpdated > 0)) {
      await this.assignPermissionsToRoles();
    }
    
    return result;
  }

  // Assign permissions to roles after seeding
  private async assignPermissionsToRoles(): Promise<void> {
    try {
      console.log('🔗 Assigning permissions to roles...');
      
      const rolesData = await this.loadData();
      const rolesWithPermissions = rolesData.filter(role => role.permissions && role.permissions.length > 0);
      
      for (const roleRecord of rolesWithPermissions) {
        const role = await this.getModel().findUnique({
          where: { slug: roleRecord.slug.toLowerCase() }
        });
        
        if (!role) {
          console.warn(`⚠️ Role '${roleRecord.slug}' not found, skipping permission assignment`);
          continue;
        }

        for (const permissionSlug of roleRecord.permissions!) {
          const permission = await this.prisma.permissions.findUnique({
            where: { slug: permissionSlug }
          });

          if (!permission) {
            console.warn(`⚠️ Permission '${permissionSlug}' not found for role '${roleRecord.slug}'`);
            continue;
          }

          // Check if role already has this permission
          const existingRolePermission = await this.prisma.role_permissions.findUnique({
            where: {
              role_id_permission_id_unique: {
                role_id: role.id,
                permission_id: permission.id
              }
            }
          });

          if (!existingRolePermission) {
            await this.prisma.role_permissions.create({
              data: {
                role_id: role.id,
                permission_id: permission.id,
                created_by: this.options.systemUserId,
                updated_by: this.options.systemUserId
              }
            });
            console.log(`✅ Assigned permission '${permissionSlug}' to role '${roleRecord.slug}'`);
          } else {
            console.log(`⏭️ Permission '${permissionSlug}' already assigned to role '${roleRecord.slug}'`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error assigning permissions to roles:', error);
    }
  }

  // Helper method to get role with permissions
  async getRoleWithPermissions(slug: string) {
    return await this.safeExecute(async () => {
      return await this.prisma.roles.findUnique({
        where: { slug },
        include: {
          role_permissions: {
            include: {
              permissions: true
            }
          }
        }
      });
    });
  }
}