// prisma/seeds/classes/PublicSystemLogsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface SystemLogSeedData {
  level: string;
  action: string;
  message: string;
  context?: any;
  user_id?: number;
  ip_address?: string;
  user_agent?: string;
  module?: string;
  entity_type?: string;
  entity_id?: number;
  created_at?: string;
}

export class PublicSystemLogsSeeder extends BaseSeed<SystemLogSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'system_logs';
  }

  getJsonFileName(): string {
    return 'public/system-logs.json';
  }

  getDependencies(): string[] {
    return ['users'];
  }

  validateRecord(record: SystemLogSeedData): boolean {
    // Required fields validation
    if (!record.level) {
      logger.error('System log record missing required level field', { source: 'PublicSystemLogsSeeder', method: 'validateRecord', record });
      return false;
    }

    if (!record.action) {
      logger.error('System log record missing required action field', { source: 'PublicSystemLogsSeeder', method: 'validateRecord', record });
      return false;
    }

    if (!record.message) {
      logger.error('System log record missing required message field', { source: 'PublicSystemLogsSeeder', method: 'validateRecord', record });
      return false;
    }

    // Length validations
    if (record.level.length > 20) {
      logger.error('System log level too long (max 20 characters)', { source: 'PublicSystemLogsSeeder', method: 'validateRecord', level: record.level });
      return false;
    }

    if (record.action.length > 100) {
      logger.error('System log action too long (max 100 characters)', { source: 'PublicSystemLogsSeeder', method: 'validateRecord', action: record.action });
      return false;
    }

    if (record.ip_address && record.ip_address.length > 45) {
      logger.error('IP address too long (max 45 characters)', { source: 'PublicSystemLogsSeeder', method: 'validateRecord', ip_address: record.ip_address });
      return false;
    }

    if (record.user_agent && record.user_agent.length > 500) {
      logger.error('User agent too long (max 500 characters)', { source: 'PublicSystemLogsSeeder', method: 'validateRecord', user_agent: record.user_agent.length });
      return false;
    }

    if (record.module && record.module.length > 50) {
      logger.error('Module name too long (max 50 characters)', { source: 'PublicSystemLogsSeeder', method: 'validateRecord', module: record.module });
      return false;
    }

    if (record.entity_type && record.entity_type.length > 50) {
      logger.error('Entity type too long (max 50 characters)', { source: 'PublicSystemLogsSeeder', method: 'validateRecord', entity_type: record.entity_type });
      return false;
    }

    // Date validation
    if (record.created_at && isNaN(Date.parse(record.created_at))) {
      logger.error('Invalid created at date format', { source: 'PublicSystemLogsSeeder', method: 'validateRecord', created_at: record.created_at });
      return false;
    }

    return true;
  }

  transformRecord(record: SystemLogSeedData): any {
    return {
      level: record.level.trim(),
      action: record.action.trim(),
      message: record.message.trim(),
      context: record.context || null,
      user_id: record.user_id || null,
      ip_address: record.ip_address?.trim() || null,
      user_agent: record.user_agent?.trim() || null,
      module: record.module?.trim() || null,
      entity_type: record.entity_type?.trim() || null,
      entity_id: record.entity_id || null,
      created_at: record.created_at ? new Date(record.created_at) : new Date()
    };
  }

  async findExistingRecord(record: SystemLogSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: {
          level: record.level,
          action: record.action,
          message: record.message,
          created_at: record.created_at ? new Date(record.created_at) : undefined
        }
      });
    });
  }
}