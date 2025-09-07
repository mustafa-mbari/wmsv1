// prisma/seeds/classes/BaseSeed.ts
// Base class for all seed operations

import { PrismaClient } from '@prisma/client';
import { JsonReader } from '../utils/JsonReader';
import { SeedValidator } from '../utils/SeedValidator';

export interface SeedOptions {
  force?: boolean;           // Force re-seed even if data exists
  validate?: boolean;        // Validate data before seeding
  batchSize?: number;        // Number of records to process at once
  systemUserId?: number;     // System user ID for audit fields
}

export interface SeedResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: string[];
  duration: number;
}

export abstract class BaseSeed<T = any> {
  protected prisma: PrismaClient;
  protected jsonReader: JsonReader;
  protected validator: SeedValidator;
  protected options: SeedOptions;

  constructor(
    prisma: PrismaClient,
    options: SeedOptions = {}
  ) {
    this.prisma = prisma;
    this.jsonReader = new JsonReader();
    this.validator = new SeedValidator();
    this.options = {
      force: false,
      validate: true,
      batchSize: 100,
      systemUserId: 1,
      ...options
    };
  }

  // Abstract methods that must be implemented by each seeder
  abstract getModelName(): string;
  abstract getJsonFileName(): string;
  abstract validateRecord(record: T): boolean;
  abstract transformRecord(record: T): any;
  abstract findExistingRecord(record: T): Promise<any>;

  // Optional method to get dependencies (seeds that must run first)
  getDependencies(): string[] {
    return [];
  }

  // Main seeding method
  async seed(): Promise<SeedResult> {
    const startTime = Date.now();
    const result: SeedResult = {
      success: false,
      recordsProcessed: 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: 0,
      errors: [],
      duration: 0
    };

    try {
      console.log(`🌱 Starting ${this.getModelName()} seeder...`);

      // Check if seeding is needed
      if (!this.options.force && await this.hasExistingData()) {
        console.log(`⏭️ ${this.getModelName()} already has data, skipping...`);
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Load and validate data
      const rawData = await this.loadData();
      if (!rawData || rawData.length === 0) {
        console.log(`📭 No data found for ${this.getModelName()}`);
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Process data in batches
      const batches = this.createBatches(rawData, this.options.batchSize!);
      
      for (const batch of batches) {
        const batchResult = await this.processBatch(batch);
        result.recordsProcessed += batchResult.recordsProcessed;
        result.recordsCreated += batchResult.recordsCreated;
        result.recordsUpdated += batchResult.recordsUpdated;
        result.recordsSkipped += batchResult.recordsSkipped;
        result.errors.push(...batchResult.errors);
      }

      result.success = result.errors.length === 0;
      result.duration = Date.now() - startTime;

      console.log(`✅ ${this.getModelName()} seeder completed:`);
      console.log(`   📊 Processed: ${result.recordsProcessed}`);
      console.log(`   ➕ Created: ${result.recordsCreated}`);
      console.log(`   ✏️ Updated: ${result.recordsUpdated}`);
      console.log(`   ⏭️ Skipped: ${result.recordsSkipped}`);
      console.log(`   ⏱️ Duration: ${result.duration}ms`);
      
      if (result.errors.length > 0) {
        console.log(`   ❌ Errors: ${result.errors.length}`);
      }

    } catch (error) {
      result.errors.push(`Fatal error: ${error}`);
      result.success = false;
      result.duration = Date.now() - startTime;
      console.error(`💥 ${this.getModelName()} seeder failed:`, error);
    }

    return result;
  }

  // Load data from JSON file
  protected async loadData(): Promise<T[]> {
    try {
      const data = await this.jsonReader.readJsonFile<T>(this.getJsonFileName());
      console.log(`📂 Loaded ${data.length} records from ${this.getJsonFileName()}`);
      return data;
    } catch (error) {
      console.error(`❌ Failed to load ${this.getJsonFileName()}:`, error);
      return [];
    }
  }

  // Check if model already has data
  protected async hasExistingData(): Promise<boolean> {
    try {
      const model = (this.prisma as any)[this.getModelName()];
      const count = await model.count();
      return count > 0;
    } catch (error) {
      console.error(`Error checking existing data for ${this.getModelName()}:`, error);
      return false;
    }
  }

  // Create batches from array
  protected createBatches<U>(array: U[], batchSize: number): U[][] {
    const batches: U[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  // Process a batch of records
  protected async processBatch(batch: T[]): Promise<SeedResult> {
    const result: SeedResult = {
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

        // Validate record if validation is enabled
        if (this.options.validate && !this.validateRecord(record)) {
          result.recordsSkipped++;
          result.errors.push(`Invalid record: ${JSON.stringify(record)}`);
          continue;
        }

        // Transform record for database
        const transformedRecord = this.transformRecord(record);

        // Add audit fields
        const recordWithAudit = this.addAuditFields(transformedRecord);

        // Check if record exists
        const existingRecord = await this.findExistingRecord(record);

        const model = (this.prisma as any)[this.getModelName()];

        if (existingRecord) {
          if (this.options.force) {
            // Update existing record
            await model.update({
              where: { id: existingRecord.id },
              data: {
                ...recordWithAudit,
                updated_by: this.options.systemUserId,
                updated_at: new Date()
              }
            });
            result.recordsUpdated++;
          } else {
            // Skip existing record
            result.recordsSkipped++;
          }
        } else {
          // Create new record
          await model.create({
            data: recordWithAudit
          });
          result.recordsCreated++;
        }

      } catch (error) {
        result.errors.push(`Error processing record: ${error}`);
        result.success = false;
      }
    }

    return result;
  }

  // Add audit fields to record
  protected addAuditFields(record: any): any {
    return {
      ...record,
      created_by: this.options.systemUserId,
      updated_by: this.options.systemUserId,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // Helper method to get model instance
  protected getModel() {
    return (this.prisma as any)[this.getModelName()];
  }

  // Helper method to safely execute database operations
  protected async safeExecute<U>(operation: () => Promise<U>): Promise<U | null> {
    try {
      return await operation();
    } catch (error) {
      console.error(`Database operation failed:`, error);
      return null;
    }
  }

  // Clean up resources
  async cleanup(): Promise<void> {
    // Override in subclasses if needed
  }
}