// prisma/seeds/classes/WarehouseSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from '.././BaseSeed';
import logger from '@my-app/backend/src/utils/logger/logger';

export interface WarehouseSeedData {
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  manager_username?: string; // Username of the manager
  is_active?: boolean;
  capacity?: number;
  warehouse_type?: 'main' | 'distribution' | 'cold_storage' | 'retail' | 'transit';
}

export class WarehouseSeeder extends BaseSeed<WarehouseSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'warehouses';
  }

  getJsonFileName(): string {
    return 'warehouse/warehouses.json';
  }

  getDependencies(): string[] {
    return ['users']; // Warehouses depend on users (for manager assignment)
  }

  validateRecord(record: WarehouseSeedData): boolean {
    // Required fields validation
    if (!record.name || !record.code) {
      logger.error('Warehouse record missing required fields', { source: 'WarehouseSeeder', method: 'validateRecord', record });
      return false;
    }

    // Name length validation
    if (record.name.length > 100) {
      logger.error('Warehouse name too long (max 100 characters)', { source: 'WarehouseSeeder', method: 'validateRecord', name: record.name, length: record.name.length });
      return false;
    }

    // Code length validation
    if (record.code.length > 20) {
      logger.error('Warehouse code too long (max 20 characters)', { source: 'WarehouseSeeder', method: 'validateRecord', code: record.code, length: record.code.length });
      return false;
    }

    // Code format validation (uppercase letters, numbers, underscore, hyphen)
    const codeRegex = /^[A-Z0-9_-]+$/;
    if (!codeRegex.test(record.code)) {
      logger.error('Invalid warehouse code format (use uppercase, numbers, _ or -)', { source: 'WarehouseSeeder', method: 'validateRecord', code: record.code });
      return false;
    }

    // Email validation if provided
    if (record.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        logger.error('Invalid email format', { source: 'WarehouseSeeder', method: 'validateRecord', email: record.email });
        return false;
      }
    }

    // Phone validation if provided
    if (record.phone) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      if (!phoneRegex.test(record.phone) || record.phone.length > 20) {
        logger.error('Invalid phone format or too long', { source: 'WarehouseSeeder', method: 'validateRecord', phone: record.phone });
        return false;
      }
    }

    // Postal code validation if provided
    if (record.postal_code && record.postal_code.length > 20) {
      logger.error('Postal code too long (max 20 characters)', { source: 'WarehouseSeeder', method: 'validateRecord', postal_code: record.postal_code, length: record.postal_code.length });
      return false;
    }

    // City, state, country validation if provided
    if (record.city && record.city.length > 100) {
      logger.error('City name too long (max 100 characters)', { source: 'WarehouseSeeder', method: 'validateRecord', city: record.city, length: record.city.length });
      return false;
    }

    if (record.state && record.state.length > 100) {
      logger.error('State name too long (max 100 characters)', { source: 'WarehouseSeeder', method: 'validateRecord', state: record.state, length: record.state.length });
      return false;
    }

    if (record.country && record.country.length > 100) {
      logger.error('Country name too long (max 100 characters)', { source: 'WarehouseSeeder', method: 'validateRecord', country: record.country, length: record.country.length });
      return false;
    }

    return true;
  }

  async transformRecord(record: WarehouseSeedData): Promise<any> {
    // Generate unique warehouse_id from code
    const warehouse_id = `WH_${record.code}`;

    return {
      warehouse_id,
      warehouse_name: record.name.trim(),
      warehouse_code: record.code.toUpperCase().trim(),
      description: null,
      warehouse_type: null,
      is_active: record.is_active !== false,
      status: 'active',
      address_line1: record.address?.trim() || null,
      address_line2: null,
      city: record.city?.trim() || null,
      state_province: record.state?.trim() || null,
      postal_code: record.postal_code?.trim() || null,
      country: record.country?.trim() || null,
      latitude: null,
      longitude: null,
      time_zone: null,
      operating_hours: null,
      contact_person: null,
      phone: record.phone?.trim() || null,
      email: record.email?.toLowerCase().trim() || null
    };
  }

  async findExistingRecord(record: WarehouseSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: {
          OR: [
            { warehouse_code: record.code.toUpperCase() },
            { warehouse_name: record.name }
          ]
        }
      });
    });
  }

  // Helper method to get warehouses by type/location
  async getWarehousesByLocation(): Promise<{
    byCountry: { [country: string]: any[] };
    byState: { [state: string]: any[] };
    byCity: { [city: string]: any[] };
  }> {
    const warehouses = await this.getModel().findMany({
      where: { is_active: true },
      include: {
        users: {
          select: {
            username: true,
            first_name: true,
            last_name: true,
            email: true
          }
        }
      },
      orderBy: [{ country: 'asc' }, { state: 'asc' }, { city: 'asc' }, { name: 'asc' }]
    });

    const result = {
      byCountry: {} as { [country: string]: any[] },
      byState: {} as { [state: string]: any[] },
      byCity: {} as { [city: string]: any[] }
    };

    warehouses.forEach(warehouse => {
      const country = warehouse.country || 'Unknown';
      const state = warehouse.state || 'Unknown';
      const city = warehouse.city || 'Unknown';

      // Group by country
      if (!result.byCountry[country]) {
        result.byCountry[country] = [];
      }
      result.byCountry[country].push(warehouse);

      // Group by state
      if (!result.byState[state]) {
        result.byState[state] = [];
      }
      result.byState[state].push(warehouse);

      // Group by city
      if (!result.byCity[city]) {
        result.byCity[city] = [];
      }
      result.byCity[city].push(warehouse);
    });

    return result;
  }

  // Helper method to validate warehouse codes
  async validateWarehouseCodes(): Promise<{
    duplicates: string[];
    invalidFormat: string[];
    recommendations: string[];
  }> {
    const warehouses = await this.getModel().findMany();
    const codeMap = new Map<string, number>();
    
    const result = {
      duplicates: [] as string[],
      invalidFormat: [] as string[],
      recommendations: [] as string[]
    };

    const codeRegex = /^[A-Z0-9_-]+$/;

    warehouses.forEach(warehouse => {
      const code = warehouse.code.toUpperCase();
      
      // Check for duplicates
      const count = codeMap.get(code) || 0;
      codeMap.set(code, count + 1);

      // Check format
      if (!codeRegex.test(code)) {
        result.invalidFormat.push(code);
      }
    });

    // Find duplicates
    codeMap.forEach((count, code) => {
      if (count > 1) {
        result.duplicates.push(code);
      }
    });

    // Generate recommendations
    if (result.duplicates.length > 0) {
      result.recommendations.push('Use unique warehouse codes to avoid conflicts');
    }

    if (result.invalidFormat.length > 0) {
      result.recommendations.push('Use only uppercase letters, numbers, underscores, and hyphens in warehouse codes');
    }

    // Suggest standard naming conventions
    result.recommendations.push('Consider using location-based codes: WH[COUNTRY][CITY][NUMBER] (e.g., WHUSNY001)');
    result.recommendations.push('Consider using type-based codes: [TYPE][LOCATION][NUMBER] (e.g., DC001, CS001)');

    return result;
  }

  // Helper method to get warehouse statistics
  async getWarehouseStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withManagers: number;
    withoutManagers: number;
    byCountry: { [country: string]: number };
    averageManagersPerWarehouse: number;
  }> {
    const warehouses = await this.getModel().findMany({
      include: {
        users: true
      }
    });

    const stats = {
      total: warehouses.length,
      active: warehouses.filter(w => w.is_active).length,
      inactive: warehouses.filter(w => !w.is_active).length,
      withManagers: warehouses.filter(w => w.manager_id).length,
      withoutManagers: warehouses.filter(w => !w.manager_id).length,
      byCountry: {} as { [country: string]: number },
      averageManagersPerWarehouse: 0
    };

    // Count by country
    warehouses.forEach(warehouse => {
      const country = warehouse.country || 'Unknown';
      stats.byCountry[country] = (stats.byCountry[country] || 0) + 1;
    });

    // Calculate average managers per warehouse
    stats.averageManagersPerWarehouse = stats.withManagers / stats.total || 0;

    return stats;
  }

  // Helper method to assign managers to warehouses
  async assignManagersToWarehouses(): Promise<void> {
    try {
      logger.info('Assigning managers to warehouses', { source: 'WarehouseSeeder', method: 'assignManagersToWarehouses' });
      
      const warehousesData = await this.loadData();
      const warehousesWithManagers = warehousesData.filter(w => w.manager_username);
      
      for (const warehouseRecord of warehousesWithManagers) {
        const warehouse = await this.getModel().findUnique({
          where: { code: warehouseRecord.code.toUpperCase() }
        });
        
        if (!warehouse) continue;

        const manager = await this.prisma.users.findUnique({
          where: { username: warehouseRecord.manager_username!.toLowerCase() }
        });

        if (!manager) {
          logger.warn(`Manager '${warehouseRecord.manager_username}' not found for warehouse '${warehouseRecord.name}'`, { source: 'WarehouseSeeder', method: 'assignManagersToWarehouses', manager_username: warehouseRecord.manager_username, warehouse_name: warehouseRecord.name });
          continue;
        }

        // Update warehouse with manager
        await this.getModel().update({
          where: { id: warehouse.id },
          data: {
            manager_id: manager.id,
            updated_by: this.options.systemUserId,
            updated_at: new Date()
          }
        });

        logger.info(`Assigned manager '${warehouseRecord.manager_username}' to warehouse '${warehouseRecord.name}'`, { source: 'WarehouseSeeder', method: 'assignManagersToWarehouses', manager_username: warehouseRecord.manager_username, warehouse_name: warehouseRecord.name });
      }
      
    } catch (error) {
      logger.error('Error assigning managers to warehouses', { source: 'WarehouseSeeder', method: 'assignManagersToWarehouses', error: error instanceof Error ? error.message : error });
    }
  }
}