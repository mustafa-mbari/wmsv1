// prisma/seeds/classes/PublicSystemSettingsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface SettingSeedData {
  key: string;
  value?: string;
  type?: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  group?: string;
  is_public?: boolean;
  is_editable?: boolean;
}

export class SystemSettingsSeeder extends BaseSeed<SettingSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'system_settings';
  }

  getJsonFileName(): string {
    return 'public/system-settings.json';
  }

  getDependencies(): string[] {
    return []; // System settings have no dependencies
  }

  validateRecord(record: SettingSeedData): boolean {
    // Required fields validation
    if (!record.key) {
      logger.error('System setting record missing required key field', { source: 'PublicSystemSettingsSeeder', method: 'validateRecord', record });
      return false;
    }

    // Key length validation
    if (record.key.length > 100) {
      logger.error('System setting key too long (max 100 characters)', { source: 'PublicSystemSettingsSeeder', method: 'validateRecord', key: record.key, length: record.key.length });
      return false;
    }

    // Type validation if provided
    if (record.type && !['string', 'number', 'boolean', 'json'].includes(record.type)) {
      logger.error('Invalid type (must be: string, number, boolean, json)', { source: 'PublicSystemSettingsSeeder', method: 'validateRecord', type: record.type });
      return false;
    }

    // Group length validation
    if (record.group && record.group.length > 50) {
      logger.error('System setting group too long (max 50 characters)', { source: 'PublicSystemSettingsSeeder', method: 'validateRecord', group: record.group });
      return false;
    }

    return true;
  }

  transformRecord(record: SettingSeedData): any {
    return {
      key: record.key.trim(),
      value: record.value?.trim() || null,
      type: record.type || 'string',
      description: record.description?.trim() || null,
      group: record.group?.trim() || null,
      is_public: record.is_public === true,
      is_editable: record.is_editable !== false // Default to true
    };
  }

  async findExistingRecord(record: SettingSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { key: record.key }
      });
    });
  }
}