// prisma/seeds/classes/InventoryInventoryCountsSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '../BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface InventoryCountSeedData {
  count_id: string;
  warehouse_id?: string;
  count_name?: string;
  count_type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  expected_completion?: string;
  team_leader?: string;
  count_team?: string;
  count_method?: string;
  count_frequency?: string;
  count_zone?: string;
  count_category?: string;
  variance_threshold?: number;
  is_approved?: boolean;
  approved_at?: string;
  approved_by?: string;
  is_recount?: boolean;
  original_count_id?: string;
  priority?: string;
  notes?: string;
}

export class InventoryInventoryCountsSeeder extends BaseSeed<InventoryCountSeedData> {

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'inventory_counts';
  }

  getJsonFileName(): string {
    return 'inventory/inventory-counts.json';
  }

  getDependencies(): string[] {
    return ['warehouses'];
  }

  validateRecord(record: InventoryCountSeedData): boolean {
    // Required fields validation
    if (!record.count_id) {
      logger.error('Inventory count record missing required count_id field', { source: 'InventoryInventoryCountsSeeder', method: 'validateRecord', record });
      return false;
    }

    // Variance threshold validation
    if (record.variance_threshold !== undefined && record.variance_threshold < 0) {
      logger.error('Variance threshold cannot be negative', { source: 'InventoryInventoryCountsSeeder', method: 'validateRecord', variance_threshold: record.variance_threshold });
      return false;
    }

    // Date validation
    if (record.start_date && isNaN(Date.parse(record.start_date))) {
      logger.error('Invalid start date format', { source: 'InventoryInventoryCountsSeeder', method: 'validateRecord', start_date: record.start_date });
      return false;
    }

    if (record.end_date && isNaN(Date.parse(record.end_date))) {
      logger.error('Invalid end date format', { source: 'InventoryInventoryCountsSeeder', method: 'validateRecord', end_date: record.end_date });
      return false;
    }

    if (record.expected_completion && isNaN(Date.parse(record.expected_completion))) {
      logger.error('Invalid expected completion date format', { source: 'InventoryInventoryCountsSeeder', method: 'validateRecord', expected_completion: record.expected_completion });
      return false;
    }

    if (record.approved_at && isNaN(Date.parse(record.approved_at))) {
      logger.error('Invalid approved at date format', { source: 'InventoryInventoryCountsSeeder', method: 'validateRecord', approved_at: record.approved_at });
      return false;
    }

    return true;
  }

  transformRecord(record: InventoryCountSeedData): any {
    return {
      count_id: record.count_id.trim(),
      warehouse_id: record.warehouse_id?.trim() || null,
      count_name: record.count_name?.trim() || null,
      count_type: record.count_type?.trim() || 'cycle_count',
      status: record.status?.trim() || 'scheduled',
      start_date: record.start_date ? new Date(record.start_date) : null,
      end_date: record.end_date ? new Date(record.end_date) : null,
      expected_completion: record.expected_completion ? new Date(record.expected_completion) : null,
      team_leader: record.team_leader?.trim() || null,
      count_team: record.count_team?.trim() || null,
      count_method: record.count_method?.trim() || 'manual',
      count_frequency: record.count_frequency?.trim() || null,
      count_zone: record.count_zone?.trim() || null,
      count_category: record.count_category?.trim() || null,
      variance_threshold: record.variance_threshold || 5.0,
      is_approved: record.is_approved === true,
      approved_at: record.approved_at ? new Date(record.approved_at) : null,
      approved_by: record.approved_by?.trim() || null,
      is_recount: record.is_recount === true,
      original_count_id: record.original_count_id?.trim() || null,
      priority: record.priority?.trim() || 'normal',
      notes: record.notes?.trim() || null
    };
  }

  async findExistingRecord(record: InventoryCountSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { count_id: record.count_id }
      });
    });
  }
}