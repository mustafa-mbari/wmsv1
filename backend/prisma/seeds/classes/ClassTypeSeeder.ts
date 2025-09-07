// prisma/seeds/classes/ClassTypeSeeder.ts
import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions } from './BaseSeed';

export interface ClassTypeSeedData {
  name: string;
  description?: string;
  is_active?: boolean;
  priority?: number;
  handling_instructions?: string;
  storage_requirements?: string;
  safety_level?: 'low' | 'medium' | 'high' | 'critical';
}

export class ClassTypeSeeder extends BaseSeed<ClassTypeSeedData> {
  
  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    super(prisma, options);
  }

  getModelName(): string {
    return 'class_types';
  }

  getJsonFileName(): string {
    return 'class-types.json';
  }

  getDependencies(): string[] {
    return []; // Class types have no dependencies
  }

  validateRecord(record: ClassTypeSeedData): boolean {
    // Required fields validation
    if (!record.name) {
      console.error('Class type record missing required name field:', record);
      return false;
    }

    // Name length validation
    if (record.name.length > 100) {
      console.error('Class type name too long (max 100 characters):', record.name);
      return false;
    }

    // Priority validation if provided
    if (record.priority !== undefined && (record.priority < 1 || record.priority > 10)) {
      console.error('Priority must be between 1 and 10:', record.priority);
      return false;
    }

    // Safety level validation if provided
    if (record.safety_level && !['low', 'medium', 'high', 'critical'].includes(record.safety_level)) {
      console.error('Invalid safety level (must be: low, medium, high, critical):', record.safety_level);
      return false;
    }

    return true;
  }

  transformRecord(record: ClassTypeSeedData): any {
    return {
      name: record.name.trim(),
      description: record.description?.trim() || null,
      is_active: record.is_active !== false // Default to true
    };
  }

  async findExistingRecord(record: ClassTypeSeedData): Promise<any> {
    return await this.safeExecute(async () => {
      return await this.getModel().findFirst({
        where: { name: record.name }
      });
    });
  }

  // Helper method to get class types by priority
  async getClassTypesByPriority(): Promise<{
    high: any[];
    medium: any[];
    low: any[];
    unassigned: any[];
  }> {
    const classTypes = await this.getModel().findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    });

    const result = {
      high: [] as any[],
      medium: [] as any[],
      low: [] as any[],
      unassigned: [] as any[]
    };

    classTypes.forEach(classType => {
      const name = classType.name.toLowerCase();
      
      // Categorize based on common naming patterns
      if (name.includes('a-class') || name.includes('critical') || name.includes('hazardous') || name.includes('high')) {
        result.high.push(classType);
      } else if (name.includes('b-class') || name.includes('medium') || name.includes('fragile')) {
        result.medium.push(classType);
      } else if (name.includes('c-class') || name.includes('low') || name.includes('bulk')) {
        result.low.push(classType);
      } else {
        result.unassigned.push(classType);
      }
    });

    return result;
  }

  // Helper method to get ABC analysis class types
  async getABCClassTypes(): Promise<{
    aClass: any[];
    bClass: any[];
    cClass: any[];
    other: any[];
  }> {
    const classTypes = await this.getModel().findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    });

    const result = {
      aClass: [] as any[],
      bClass: [] as any[],
      cClass: [] as any[],
      other: [] as any[]
    };

    classTypes.forEach(classType => {
      const name = classType.name.toLowerCase();
      
      if (name.includes('a-class') || name === 'a') {
        result.aClass.push(classType);
      } else if (name.includes('b-class') || name === 'b') {
        result.bClass.push(classType);
      } else if (name.includes('c-class') || name === 'c') {
        result.cClass.push(classType);
      } else {
        result.other.push(classType);
      }
    });

    return result;
  }

  // Helper method to get special handling class types
  async getSpecialHandlingTypes(): Promise<{
    fragile: any[];
    hazardous: any[];
    perishable: any[];
    controlled: any[];
    bulk: any[];
    standard: any[];
  }> {
    const classTypes = await this.getModel().findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' }
    });

    const result = {
      fragile: [] as any[],
      hazardous: [] as any[],
      perishable: [] as any[],
      controlled: [] as any[],
      bulk: [] as any[],
      standard: [] as any[]
    };

    classTypes.forEach(classType => {
      const name = classType.name.toLowerCase();
      const description = (classType.description || '').toLowerCase();
      
      if (name.includes('fragile') || description.includes('fragile') || description.includes('breakable')) {
        result.fragile.push(classType);
      } else if (name.includes('hazardous') || name.includes('dangerous') || description.includes('hazard')) {
        result.hazardous.push(classType);
      } else if (name.includes('perishable') || description.includes('expir') || description.includes('perishable')) {
        result.perishable.push(classType);
      } else if (name.includes('controlled') || description.includes('controlled') || description.includes('restricted')) {
        result.controlled.push(classType);
      } else if (name.includes('bulk') || description.includes('bulk') || description.includes('large volume')) {
        result.bulk.push(classType);
      } else {
        result.standard.push(classType);
      }
    });

    return result;
  }

  // Helper method to validate class type consistency
  async validateClassTypeConsistency(): Promise<{
    duplicateNames: string[];
    missingABC: boolean;
    recommendations: string[];
  }> {
    const classTypes = await this.getModel().findMany();
    const nameMap = new Map<string, number>();
    
    const result = {
      duplicateNames: [] as string[],
      missingABC: false,
      recommendations: [] as string[]
    };

    // Check for duplicates
    classTypes.forEach(classType => {
      const name = classType.name.toLowerCase();
      const count = nameMap.get(name) || 0;
      nameMap.set(name, count + 1);
    });

    // Find duplicates
    nameMap.forEach((count, name) => {
      if (count > 1) {
        result.duplicateNames.push(name);
      }
    });

    // Check for ABC classification
    const hasAClass = classTypes.some(ct => ct.name.toLowerCase().includes('a-class') || ct.name.toLowerCase() === 'a');
    const hasBClass = classTypes.some(ct => ct.name.toLowerCase().includes('b-class') || ct.name.toLowerCase() === 'b');
    const hasCClass = classTypes.some(ct => ct.name.toLowerCase().includes('c-class') || ct.name.toLowerCase() === 'c');
    
    result.missingABC = !(hasAClass && hasBClass && hasCClass);

    // Generate recommendations
    if (result.duplicateNames.length > 0) {
      result.recommendations.push('Remove duplicate class type names to avoid confusion');
    }

    if (result.missingABC) {
      result.recommendations.push('Consider implementing ABC classification (A-Class, B-Class, C-Class) for inventory management');
    }

    // Check for common special handling types
    const hasFragile = classTypes.some(ct => ct.name.toLowerCase().includes('fragile'));
    const hasHazardous = classTypes.some(ct => ct.name.toLowerCase().includes('hazardous'));
    const hasPerishable = classTypes.some(ct => ct.name.toLowerCase().includes('perishable'));

    if (!hasFragile) {
      result.recommendations.push('Consider adding "Fragile" class type for breakable items');
    }
    if (!hasHazardous) {
      result.recommendations.push('Consider adding "Hazardous" class type for dangerous materials');
    }
    if (!hasPerishable) {
      result.recommendations.push('Consider adding "Perishable" class type for items with expiration dates');
    }

    return result;
  }

  // Helper method to suggest class types based on industry
  async suggestClassTypesForIndustry(industry: string): Promise<string[]> {
    const suggestions: { [industry: string]: string[] } = {
      'retail': ['A-Class', 'B-Class', 'C-Class', 'Fragile', 'Bulk', 'Seasonal'],
      'food': ['Perishable', 'Frozen', 'Dry Goods', 'Fragile', 'Bulk', 'Temperature Controlled'],
      'pharmaceutical': ['Controlled', 'Refrigerated', 'Hazardous', 'High Value', 'Prescription', 'OTC'],
      'electronics': ['Fragile', 'High Value', 'ESD Sensitive', 'Temperature Sensitive', 'Bulk', 'Components'],
      'automotive': ['Heavy', 'Fragile', 'Hazardous', 'Bulk', 'Precision Parts', 'Consumables'],
      'chemicals': ['Hazardous', 'Flammable', 'Corrosive', 'Toxic', 'Controlled', 'Bulk'],
      'textiles': ['Bulk', 'Seasonal', 'Fragile', 'Fashion', 'Basic', 'Premium'],
      'general': ['A-Class', 'B-Class', 'C-Class', 'Fragile', 'Bulk', 'Standard']
    };

    return suggestions[industry.toLowerCase()] || suggestions['general'];
  }

  // Helper method to get class type statistics
  async getClassTypeStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    mostCommonTypes: { name: string; count: number }[];
    coverage: number;
  }> {
    const classTypes = await this.getModel().findMany();
    
    const stats = {
      total: classTypes.length,
      active: classTypes.filter(ct => ct.is_active).length,
      inactive: classTypes.filter(ct => !ct.is_active).length,
      mostCommonTypes: [] as { name: string; count: number }[],
      coverage: 0
    };

    // This would be expanded to include actual product usage data
    // For now, we'll return basic statistics
    stats.mostCommonTypes = classTypes
      .map(ct => ({ name: ct.name, count: 0 })) // Would be actual product counts
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Coverage would be percentage of products with assigned class types
    stats.coverage = 0; // Would be calculated from actual product data

    return stats;
  }
}