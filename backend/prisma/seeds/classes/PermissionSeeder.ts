// prisma/seeds/classes/PermissionSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';

export interface PermissionSeedData {
  name: string;
  slug: string;
  description?: string;
  module?: string;
  is_active?: boolean;
}

export class PermissionSeeder extends BaseSeed<PermissionSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'permissions';
  }

  getJsonFileName(): string {
    return 'permissions.json';
  }

  getDependencies(): string[] {
    return []; // Permissions have no dependencies
  }

  validateRecord(record: PermissionSeedData): boolean {
    // Required fields validation
    if (!record.name || !record.slug) {
      console.error('Permission record missing required fields:', record);
      return false;
    }

    // Slug format validation (lowercase, numbers, underscore, hyphen only)
    const slugRegex = /^[a-z0-9_-]+$/;
    if (!slugRegex.test(record.slug)) {
      console.error('Invalid permission slug format (use lowercase, numbers, _ or -):', record.slug);
      return false;
    }

    // Name length validation
    if (record.name.length > 100) {
      console.error('Permission name too long (max 100 characters):', record.name);
      return false;
    }

    // Slug length validation
    if (record.slug.length > 100) {
      console.error('Permission slug too long (max 100 characters):', record.slug);
      return false;
    }

    // Module validation if provided
    if (record.module && record.module.length > 50) {
      console.error('Permission module too long (max 50 characters):', record.module);
      return false;
    }

    return true;
  }

  transformRecord(record: PermissionSeedData): any {
    return {
      name: record.name.trim(),
      slug: record.slug.toLowerCase().trim(),
      description: record.description?.trim() || null,
      module: record.module?.toLowerCase().trim() || null,
      is_active: record.is_active !== false // Default to true
    };
  }

  async findExistingRecord(record: PermissionSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findUnique({
        where: { slug: record.slug.toLowerCase() }
      });
    });
  }

  // Helper method to create permission groups
  async createPermissionGroups() {
    const permissions = await this.getModel().findMany({
      where: { is_active: true },
      orderBy: [{ module: 'asc' }, { name: 'asc' }]
    });

    const groupedPermissions: { [module: string]: any[] } = {};
    
    permissions.forEach(permission => {
      const module = permission.module || 'general';
      if (!groupedPermissions[module]) {
        groupedPermissions[module] = [];
      }
      groupedPermissions[module].push(permission);
    });

    return groupedPermissions;
  }

  // Helper method to validate permission dependencies
  async validatePermissionDependencies(rolePermissions: string[]): Promise<{
    valid: boolean;
    missing: string[];
    invalid: string[];
  }> {
    const result = {
      valid: true,
      missing: [] as string[],
      invalid: [] as string[]
    };

    for (const permSlug of rolePermissions) {
      const permission = await this.prisma.permissions.findUnique({
        where: { slug: permSlug }
      });

      if (!permission) {
        result.missing.push(permSlug);
        result.valid = false;
      } else if (!permission.is_active) {
        result.invalid.push(permSlug);
        result.valid = false;
      }
    }

    return result;
  }

  // Helper method to get permissions by module
  async getPermissionsByModule(module: string) {
    return await this.safeExecute(async () => {
      return await this.getModel().findMany({
        where: { 
          module: module.toLowerCase(),
          is_active: true 
        },
        orderBy: { name: 'asc' }
      });
    });
  }

  // Helper method to get all modules
  async getModules(): Promise<string[]> {
    const result = await this.safeExecute(async () => {
      return await this.prisma.permissions.findMany({
        where: { is_active: true },
        select: { module: true },
        distinct: ['module']
      });
    });

    return result ? result.map(r => r.module).filter(Boolean).sort() : [];
  }
}