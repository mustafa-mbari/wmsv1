// prisma/seeds/classes/UserSeeder.ts
// Example implementation of a specific seeder

import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';
import * as bcrypt from 'bcrypt';

export interface UserSeedData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  gender?: string;
  avatar_url?: string;
  is_active?: boolean;
  email_verified?: boolean;
  roles?: string[]; // Role slugs to assign
}

export class UserSeeder extends BaseSeed<UserSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'users';
  }

  getJsonFileName(): string {
    return 'users.json';
  }

  getDependencies(): string[] {
    return ['roles']; // Users depend on roles being seeded first
  }

  validateRecord(record: UserSeedData): boolean {
    // Required fields validation
    if (!record.username || !record.email || !record.password) {
      console.error('User record missing required fields:', record);
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(record.email)) {
      console.error('Invalid email format:', record.email);
      return false;
    }

    // Username validation (no spaces, special chars)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(record.username)) {
      console.error('Invalid username format:', record.username);
      return false;
    }

    // Password strength validation
    if (record.password.length < 6) {
      console.error('Password too short:', record.username);
      return false;
    }

    return true;
  }

  async transformRecord(record: UserSeedData): Promise<any> {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(record.password, saltRounds);

    // Parse birth_date if provided
    let birthDate: Date | null = null;
    if (record.birth_date) {
      birthDate = new Date(record.birth_date);
      if (isNaN(birthDate.getTime())) {
        console.warn(`Invalid birth_date for user ${record.username}, skipping`);
        birthDate = null;
      }
    }

    return {
      username: record.username.toLowerCase(),
      email: record.email.toLowerCase(),
      password_hash: hashedPassword,
      first_name: record.first_name,
      last_name: record.last_name,
      phone: record.phone || null,
      address: record.address || null,
      birth_date: birthDate,
      gender: record.gender || null,
      avatar_url: record.avatar_url || null,
      is_active: record.is_active !== false, // Default to true
      email_verified: record.email_verified || false,
      email_verified_at: record.email_verified ? new Date() : null
    };
  }

  async findExistingRecord(record: UserSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: {
          OR: [
            { username: record.username.toLowerCase() },
            { email: record.email.toLowerCase() }
          ]
        }
      });
    });
  }

  // Override seed method to handle role assignments
  async seed() {
    const result = await super.seed();
    
    if (result.success && (result.recordsCreated > 0 || result.recordsUpdated > 0)) {
      await this.assignRolesToUsers();
    }
    
    return result;
  }

  // Assign roles to users after seeding
  private async assignRolesToUsers(): Promise<void> {
    try {
      console.log('🔗 Assigning roles to users...');
      
      const userData = await this.loadData();
      const usersWithRoles = userData.filter(user => user.roles && user.roles.length > 0);
      
      for (const userRecord of usersWithRoles) {
        const user = await this.getModel().findUnique({
          where: { username: userRecord.username.toLowerCase() }
        });
        
        if (!user) continue;

        for (const roleSlug of userRecord.roles!) {
          const role = await this.prisma.roles.findUnique({
            where: { slug: roleSlug }
          });

          if (!role) {
            console.warn(`⚠️ Role '${roleSlug}' not found for user '${userRecord.username}'`);
            continue;
          }

          // Check if user already has this role
          const existingUserRole = await this.prisma.user_roles.findUnique({
            where: {
              user_id_role_id_unique: {
                user_id: user.id,
                role_id: role.id
              }
            }
          });

          if (!existingUserRole) {
            await this.prisma.user_roles.create({
              data: {
                user_id: user.id,
                role_id: role.id,
                assigned_by: this.options.systemUserId,
                created_by: this.options.systemUserId,
                updated_by: this.options.systemUserId
              }
            });
            console.log(`✅ Assigned role '${roleSlug}' to user '${userRecord.username}'`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error assigning roles to users:', error);
    }
  }
}