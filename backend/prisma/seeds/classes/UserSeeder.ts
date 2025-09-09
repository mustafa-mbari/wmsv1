// prisma/seeds/classes/UserSeeder.ts
// Example implementation of a specific seeder

import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';
import * as bcrypt from 'bcrypt';
import logger from '../../../src/utils/logger/logger';

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
      logger.error('User record missing required fields', { source: 'UserSeeder', method: 'validateRecord', record });
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(record.email)) {
      logger.error('Invalid email format', { source: 'UserSeeder', method: 'validateRecord', email: record.email });
      return false;
    }

    // Username validation (no spaces, special chars)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(record.username)) {
      logger.error('Invalid username format', { source: 'UserSeeder', method: 'validateRecord', username: record.username });
      return false;
    }

    // Password strength validation
    if (record.password.length < 6) {
      logger.error('Password too short', { source: 'UserSeeder', method: 'validateRecord', username: record.username });
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
        logger.warn(`Invalid birth_date for user ${record.username}, skipping`, { source: 'UserSeeder', method: 'transformRecord', username: record.username, birth_date: record.birth_date });
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

  // Override seed method to handle role assignments and existing data better
  async seed() {
    const startTime = Date.now();
    const result = {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      duration: 0
    };

    try {
      logger.info(`Starting ${this.getModelName()} seeder`, { source: 'UserSeeder', method: 'seed' });

      // Load data regardless of existing data
      const rawData = await this.loadData();
      if (!rawData || rawData.length === 0) {
        logger.info(`No data found for ${this.getModelName()}`, { source: 'UserSeeder', method: 'seed' });
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      logger.info(`Processing ${rawData.length} user records`, { source: 'UserSeeder', method: 'seed', recordCount: rawData.length });

      // Process each user individually
      for (const userRecord of rawData) {
        try {
          result.recordsProcessed++;

          // Validate record
          if (this.options.validate && !this.validateRecord(userRecord)) {
            result.recordsSkipped++;
            result.errors.push(`Invalid user record: ${userRecord.username || 'unknown'}`);
            logger.warn(`Skipping invalid user record`, { source: 'UserSeeder', method: 'seed', username: userRecord.username });
            continue;
          }

          // Check if user already exists
          const existingUser = await this.findExistingRecord(userRecord);
          
          if (existingUser && !this.options.force) {
            result.recordsSkipped++;
            logger.info(`User '${userRecord.username}' already exists, skipping`, { source: 'UserSeeder', method: 'seed', username: userRecord.username });
            continue;
          }

          // Transform record
          const transformedRecord = await this.transformRecord(userRecord);

          if (existingUser && this.options.force) {
            // Update existing user
            await this.getModel().update({
              where: { id: existingUser.id },
              data: {
                ...transformedRecord,
                updated_at: new Date(),
                updated_by: this.options.systemUserId
              }
            });
            result.recordsUpdated++;
            logger.info(`Updated user '${userRecord.username}'`, { source: 'UserSeeder', method: 'seed', username: userRecord.username });
          } else {
            // Create new user
            await this.getModel().create({
              data: {
                ...transformedRecord,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: this.options.systemUserId,
                updated_by: this.options.systemUserId
              }
            });
            result.recordsCreated++;
            logger.info(`Created user '${userRecord.username}'`, { source: 'UserSeeder', method: 'seed', username: userRecord.username });
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          result.errors.push(`Error processing user '${userRecord.username}': ${errorMessage}`);
          logger.error(`Error processing user record`, { 
            source: 'UserSeeder', 
            method: 'seed', 
            username: userRecord.username,
            error: errorMessage 
          });
          console.error(`[UserSeeder]: Error processing user '${userRecord.username}':`, errorMessage);
        }
      }

      result.success = result.errors.length === 0 || result.recordsCreated > 0 || result.recordsUpdated > 0;
      
      // Assign roles to users after seeding
      if (result.success && (result.recordsCreated > 0 || result.recordsUpdated > 0)) {
        await this.assignRolesToUsers();
      }

      result.duration = Date.now() - startTime;
      
      logger.info(`User seeding completed`, { 
        source: 'UserSeeder', 
        method: 'seed',
        recordsProcessed: result.recordsProcessed,
        recordsCreated: result.recordsCreated,
        recordsUpdated: result.recordsUpdated,
        recordsSkipped: result.recordsSkipped,
        errors: result.errors.length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(`Fatal error in UserSeeder: ${errorMessage}`);
      result.success = false;
      logger.error(`Fatal error in UserSeeder`, { source: 'UserSeeder', method: 'seed', error: errorMessage });
      console.error(`[UserSeeder]: Fatal error:`, errorMessage);
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  // Assign roles to users after seeding
  private async assignRolesToUsers(): Promise<void> {
    try {
      logger.info('Assigning roles to users', { source: 'UserSeeder', method: 'assignRolesToUsers' });
      
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
            logger.warn(`Role '${roleSlug}' not found for user '${userRecord.username}'`, { source: 'UserSeeder', method: 'assignRolesToUsers', role_slug: roleSlug, username: userRecord.username });
            continue;
          }

          // Check if user already has this role
          const existingUserRole = await this.prisma.user_roles.findFirst({
            where: {
              user_id: user.id,
              role_id: role.id
            }
          });

          if (!existingUserRole) {
            await this.prisma.user_roles.create({
              data: {
                user_id: user.id,
                role_id: role.id,
                assigned_by: this.options.systemUserId,
                assigned_at: new Date()
              }
            });
            logger.info(`Assigned role '${roleSlug}' to user '${userRecord.username}'`, { source: 'UserSeeder', method: 'assignRolesToUsers', role_slug: roleSlug, username: userRecord.username });
          } else {
            logger.info(`User '${userRecord.username}' already has role '${roleSlug}'`, { source: 'UserSeeder', method: 'assignRolesToUsers', role_slug: roleSlug, username: userRecord.username });
          }
        }
      }
      
    } catch (error) {
      logger.error('Error assigning roles to users', { source: 'UserSeeder', method: 'assignRolesToUsers', error: error instanceof Error ? error.message : error });
    }
  }
}