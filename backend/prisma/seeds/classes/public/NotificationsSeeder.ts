// prisma/seeds/classes/PublicNotificationsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface NotificationSeedData {
  type: string;
  title: string;
  message: string;
  data?: any;
  user_id?: number;
  email?: string;
  phone?: string;
  status?: string;
  priority?: string;
  metadata?: any;
}

export class PublicNotificationsSeeder extends BaseSeed<NotificationSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'notifications';
  }

  getJsonFileName(): string {
    return 'public/notifications.json';
  }

  getDependencies(): string[] {
    return ['users'];
  }

  validateRecord(record: NotificationSeedData): boolean {
    // Required fields validation
    if (!record.type) {
      logger.error('Notification record missing required type field', { source: 'PublicNotificationsSeeder', method: 'validateRecord', record });
      return false;
    }

    if (!record.title) {
      logger.error('Notification record missing required title field', { source: 'PublicNotificationsSeeder', method: 'validateRecord', record });
      return false;
    }

    if (!record.message) {
      logger.error('Notification record missing required message field', { source: 'PublicNotificationsSeeder', method: 'validateRecord', record });
      return false;
    }

    // Length validations
    if (record.type.length > 50) {
      logger.error('Notification type too long (max 50 characters)', { source: 'PublicNotificationsSeeder', method: 'validateRecord', type: record.type });
      return false;
    }

    if (record.title.length > 200) {
      logger.error('Notification title too long (max 200 characters)', { source: 'PublicNotificationsSeeder', method: 'validateRecord', title: record.title });
      return false;
    }

    // Status validation
    if (record.status && !['pending', 'sent', 'failed', 'read'].includes(record.status)) {
      logger.error('Invalid status (must be: pending, sent, failed, read)', { source: 'PublicNotificationsSeeder', method: 'validateRecord', status: record.status });
      return false;
    }

    // Priority validation
    if (record.priority && !['low', 'normal', 'high', 'urgent'].includes(record.priority)) {
      logger.error('Invalid priority (must be: low, normal, high, urgent)', { source: 'PublicNotificationsSeeder', method: 'validateRecord', priority: record.priority });
      return false;
    }

    return true;
  }

  transformRecord(record: NotificationSeedData): any {
    return {
      type: record.type.trim(),
      title: record.title.trim(),
      message: record.message.trim(),
      data: record.data || null,
      user_id: record.user_id || null,
      email: record.email?.trim() || null,
      phone: record.phone?.trim() || null,
      status: record.status?.trim() || 'pending',
      sent_at: null,
      read_at: null,
      retry_count: 0,
      error_message: null,
      priority: record.priority?.trim() || 'normal',
      metadata: record.metadata || null
    };
  }

  async findExistingRecord(record: NotificationSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: {
          type: record.type,
          title: record.title,
          message: record.message,
          user_id: record.user_id
        }
      });
    });
  }
}