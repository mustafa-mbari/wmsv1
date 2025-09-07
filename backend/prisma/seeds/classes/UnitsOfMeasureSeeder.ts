// prisma/seeds/classes/UnitsOfMeasureSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';

export interface UnitSeedData {
  name: string;
  symbol: string;
  description?: string;
  is_active?: boolean;
  conversion_factor?: number; // For future unit conversion functionality
  base_unit?: string; // Reference to base unit for conversions
}

export class UnitsOfMeasureSeeder extends BaseSeed<UnitSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'units_of_measure';
  }

  getJsonFileName(): string {
    return 'units-of-measure.json';
  }

  getDependencies(): string[] {
    return []; // Units have no dependencies
  }

  validateRecord(record: UnitSeedData): boolean {
    // Required fields validation
    if (!record.name || !record.symbol) {
      console.error('Unit record missing required fields:', record);
      return false;
    }

    // Name length validation
    if (record.name.length > 100) {
      console.error('Unit name too long (max 100 characters):', record.name);
      return false;
    }

    // Symbol length validation
    if (record.symbol.length > 10) {
      console.error('Unit symbol too long (max 10 characters):', record.symbol);
      return false;
    }

    // Symbol format validation (no spaces)
    if (record.symbol.includes(' ')) {
      console.error('Unit symbol cannot contain spaces:', record.symbol);
      return false;
    }

    // Conversion factor validation
    if (record.conversion_factor !== undefined && record.conversion_factor <= 0) {
      console.error('Conversion factor must be positive:', record.conversion_factor);
      return false;
    }

    return true;
  }

  transformRecord(record: UnitSeedData): any {
    return {
      name: record.name.trim(),
      symbol: record.symbol.trim(),
      description: record.description?.trim() || null,
      is_active: record.is_active !== false // Default to true
    };
  }

  async findExistingRecord(record: UnitSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: {
          OR: [
            { name: record.name },
            { symbol: record.symbol }
          ]
        }
      });
    });
  }

  // Helper method to get units by category
  async getUnitsByCategory(): Promise<{
    weight: any[];
    volume: any[];
    length: any[];
    area: any[];
    count: any[];
    packaging: any[];
  }> {
    const allUnits = await this.getModel().findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    });

    const categories = {
      weight: [] as any[],
      volume: [] as any[],
      length: [] as any[],
      area: [] as any[],
      count: [] as any[],
      packaging: [] as any[]
    };

    // Categorize units based on common patterns
    allUnits.forEach(unit => {
      const name = unit.name.toLowerCase();
      const symbol = unit.symbol.toLowerCase();

      if (name.includes('gram') || name.includes('kg') || name.includes('pound') || name.includes('ounce')) {
        categories.weight.push(unit);
      } else if (name.includes('liter') || name.includes('gallon') || name.includes('ml')) {
        categories.volume.push(unit);
      } else if (name.includes('meter') || name.includes('inch') || name.includes('foot') || name.includes('cm')) {
        categories.length.push(unit);
      } else if (name.includes('square') || symbol.includes('²')) {
        categories.area.push(unit);
      } else if (name.includes('piece') || name.includes('each') || name.includes('unit')) {
        categories.count.push(unit);
      } else if (name.includes('box') || name.includes('carton') || name.includes('pallet')) {
        categories.packaging.push(unit);
      } else {
        categories.count.push(unit); // Default category
      }
    });

    return categories;
  }

  // Helper method to validate unit consistency
  async validateUnitConsistency(): Promise<{
    duplicateNames: string[];
    duplicateSymbols: string[];
    recommendations: string[];
  }> {
    const units = await this.getModel().findMany();
    const nameMap = new Map<string, number>();
    const symbolMap = new Map<string, number>();
    
    const result = {
      duplicateNames: [] as string[],
      duplicateSymbols: [] as string[],
      recommendations: [] as string[]
    };

    // Check for duplicates
    units.forEach(unit => {
      const nameCount = nameMap.get(unit.name.toLowerCase()) || 0;
      nameMap.set(unit.name.toLowerCase(), nameCount + 1);
      
      const symbolCount = symbolMap.get(unit.symbol.toLowerCase()) || 0;
      symbolMap.set(unit.symbol.toLowerCase(), symbolCount + 1);
    });

    // Find duplicates
    nameMap.forEach((count, name) => {
      if (count > 1) {
        result.duplicateNames.push(name);
      }
    });

    symbolMap.forEach((count, symbol) => {
      if (count > 1) {
        result.duplicateSymbols.push(symbol);
      }
    });

    // Generate recommendations
    if (result.duplicateNames.length > 0) {
      result.recommendations.push('Consider using unique unit names to avoid confusion');
    }
    
    if (result.duplicateSymbols.length > 0) {
      result.recommendations.push('Use unique symbols for each unit of measure');
    }

    // Check for common missing units
    const hasWeight = units.some(u => u.name.toLowerCase().includes('kg') || u.name.toLowerCase().includes('gram'));
    const hasVolume = units.some(u => u.name.toLowerCase().includes('liter') || u.name.toLowerCase().includes('ml'));
    const hasLength = units.some(u => u.name.toLowerCase().includes('meter') || u.name.toLowerCase().includes('cm'));

    if (!hasWeight) {
      result.recommendations.push('Consider adding weight units (kg, g, lb)');
    }
    if (!hasVolume) {
      result.recommendations.push('Consider adding volume units (L, mL, gal)');
    }
    if (!hasLength) {
      result.recommendations.push('Consider adding length units (m, cm, in)');
    }

    return result;
  }

  // Helper method to get commonly used units
  async getCommonUnits(): Promise<any[]> {
    return await this.safeExecute(async () => {
      return await this.getModel().findMany({
        where: {
          AND: [
            { is_active: true },
            {
              OR: [
                { symbol: { in: ['pcs', 'kg', 'g', 'L', 'mL', 'm', 'cm', 'box'] } },
                { name: { in: ['Piece', 'Kilogram', 'Gram', 'Liter', 'Milliliter', 'Meter', 'Centimeter', 'Box'] } }
              ]
            }
          ]
        },
        orderBy: { name: 'asc' }
      });
    }) || [];
  }
}