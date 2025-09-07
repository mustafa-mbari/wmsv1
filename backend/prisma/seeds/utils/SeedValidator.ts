// prisma/seeds/utils/SeedValidator.ts
// Utility class for validating seed data

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class SeedValidator {
  
  /**
   * Validate a single record against validation rules
   */
  validateRecord(record: any, rules: ValidationRule[]): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    for (const rule of rules) {
      const fieldResult = this.validateField(record[rule.field], rule, rule.field);
      
      if (!fieldResult.valid) {
        result.valid = false;
        result.errors.push(...fieldResult.errors);
      }
      
      result.warnings.push(...fieldResult.warnings);
    }

    return result;
  }

  /**
   * Validate multiple records
   */
  validateRecords(records: any[], rules: ValidationRule[]): {
    valid: boolean;
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    results: { [index: number]: ValidationResult };
  } {
    const results: { [index: number]: ValidationResult } = {};
    let validRecords = 0;
    let invalidRecords = 0;

    records.forEach((record, index) => {
      const result = this.validateRecord(record, rules);
      results[index] = result;
      
      if (result.valid) {
        validRecords++;
      } else {
        invalidRecords++;
      }
    });

    return {
      valid: invalidRecords === 0,
      totalRecords: records.length,
      validRecords,
      invalidRecords,
      results
    };
  }

  /**
   * Validate a single field
   */
  private validateField(value: any, rule: ValidationRule, fieldName: string): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check if field is required
    if (rule.required && (value === null || value === undefined || value === '')) {
      result.valid = false;
      result.errors.push(`${fieldName} is required`);
      return result;
    }

    // Skip further validation if value is empty and not required
    if (value === null || value === undefined || value === '') {
      return result;
    }

    // Type validation
    if (rule.type) {
      const typeResult = this.validateType(value, rule.type, fieldName);
      if (!typeResult.valid) {
        result.valid = false;
        result.errors.push(...typeResult.errors);
      }
      result.warnings.push(...typeResult.warnings);
    }

    // String validations
    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        result.valid = false;
        result.errors.push(`${fieldName} must be at least ${rule.minLength} characters long`);
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        result.valid = false;
        result.errors.push(`${fieldName} must be no more than ${rule.maxLength} characters long`);
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        result.valid = false;
        result.errors.push(`${fieldName} does not match the required pattern`);
      }

      if (rule.enum && !rule.enum.includes(value)) {
        result.valid = false;
        result.errors.push(`${fieldName} must be one of: ${rule.enum.join(', ')}`);
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        result.valid = false;
        result.errors.push(`${fieldName} must be at least ${rule.min}`);
      }

      if (rule.max !== undefined && value > rule.max) {
        result.valid = false;
        result.errors.push(`${fieldName} must be no more than ${rule.max}`);
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (typeof customResult === 'string') {
        result.valid = false;
        result.errors.push(`${fieldName}: ${customResult}`);
      } else if (!customResult) {
        result.valid = false;
        result.errors.push(`${fieldName} failed custom validation`);
      }
    }

    return result;
  }

  /**
   * Validate field type
   */
  private validateType(value: any, type: string, fieldName: string): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: []
    };

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          result.valid = false;
          result.errors.push(`${fieldName} must be a string`);
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          result.valid = false;
          result.errors.push(`${fieldName} must be a valid number`);
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          result.valid = false;
          result.errors.push(`${fieldName} must be a boolean`);
        }
        break;

      case 'email':
        if (typeof value !== 'string') {
          result.valid = false;
          result.errors.push(`${fieldName} must be a string`);
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            result.valid = false;
            result.errors.push(`${fieldName} must be a valid email address`);
          }
        }
        break;

      case 'url':
        if (typeof value !== 'string') {
          result.valid = false;
          result.errors.push(`${fieldName} must be a string`);
        } else {
          try {
            new URL(value);
          } catch {
            result.valid = false;
            result.errors.push(`${fieldName} must be a valid URL`);
          }
        }
        break;

      case 'date':
        if (typeof value === 'string') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            result.valid = false;
            result.errors.push(`${fieldName} must be a valid date string`);
          }
        } else if (!(value instanceof Date)) {
          result.valid = false;
          result.errors.push(`${fieldName} must be a Date object or valid date string`);
        }
        break;

      default:
        result.warnings.push(`Unknown validation type: ${type} for field ${fieldName}`);
    }

    return result;
  }

  /**
   * Common validation rules for different entities
   */
  static getUserValidationRules(): ValidationRule[] {
    return [
      { field: 'username', required: true, type: 'string', minLength: 3, maxLength: 50, pattern: /^[a-zA-Z0-9_]+$/ },
      { field: 'email', required: true, type: 'email', maxLength: 255 },
      { field: 'password', required: true, type: 'string', minLength: 6 },
      { field: 'first_name', required: true, type: 'string', minLength: 1, maxLength: 100 },
      { field: 'last_name', required: true, type: 'string', minLength: 1, maxLength: 100 },
      { field: 'phone', required: false, type: 'string', maxLength: 20, pattern: /^[\+]?[0-9\s\-\(\)]+$/ },
      { field: 'birth_date', required: false, type: 'date' },
      { field: 'gender', required: false, type: 'string', enum: ['male', 'female', 'other'] },
      { field: 'is_active', required: false, type: 'boolean' },
      { field: 'email_verified', required: false, type: 'boolean' }
    ];
  }

  static getRoleValidationRules(): ValidationRule[] {
    return [
      { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 100 },
      { field: 'slug', required: true, type: 'string', minLength: 1, maxLength: 100, pattern: /^[a-z0-9_-]+$/ },
      { field: 'description', required: false, type: 'string', maxLength: 500 },
      { field: 'is_active', required: false, type: 'boolean' }
    ];
  }

  static getPermissionValidationRules(): ValidationRule[] {
    return [
      { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 100 },
      { field: 'slug', required: true, type: 'string', minLength: 1, maxLength: 100, pattern: /^[a-z0-9_-]+$/ },
      { field: 'description', required: false, type: 'string', maxLength: 500 },
      { field: 'module', required: false, type: 'string', maxLength: 50 },
      { field: 'is_active', required: false, type: 'boolean' }
    ];
  }

  static getProductValidationRules(): ValidationRule[] {
    return [
      { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 200 },
      { field: 'sku', required: true, type: 'string', minLength: 1, maxLength: 100 },
      { field: 'barcode', required: false, type: 'string', maxLength: 100 },
      { field: 'description', required: false, type: 'string' },
      { field: 'price', required: false, type: 'number', min: 0 },
      { field: 'cost', required: false, type: 'number', min: 0 },
      { field: 'stock_quantity', required: false, type: 'number', min: 0 },
      { field: 'min_stock_level', required: false, type: 'number', min: 0 },
      { field: 'weight', required: false, type: 'number', min: 0 },
      { field: 'status', required: false, type: 'string', enum: ['active', 'inactive', 'discontinued'] },
      { field: 'is_digital', required: false, type: 'boolean' },
      { field: 'track_stock', required: false, type: 'boolean' }
    ];
  }

  static getCategoryValidationRules(): ValidationRule[] {
    return [
      { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 100 },
      { field: 'slug', required: true, type: 'string', minLength: 1, maxLength: 100, pattern: /^[a-z0-9_-]+$/ },
      { field: 'description', required: false, type: 'string' },
      { field: 'image_url', required: false, type: 'url' },
      { field: 'sort_order', required: false, type: 'number', min: 0 },
      { field: 'is_active', required: false, type: 'boolean' }
    ];
  }

  static getWarehouseValidationRules(): ValidationRule[] {
    return [
      { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 100 },
      { field: 'code', required: true, type: 'string', minLength: 1, maxLength: 20, pattern: /^[A-Z0-9_-]+$/ },
      { field: 'address', required: false, type: 'string' },
      { field: 'city', required: false, type: 'string', maxLength: 100 },
      { field: 'state', required: false, type: 'string', maxLength: 100 },
      { field: 'country', required: false, type: 'string', maxLength: 100 },
      { field: 'postal_code', required: false, type: 'string', maxLength: 20 },
      { field: 'phone', required: false, type: 'string', maxLength: 20 },
      { field: 'email', required: false, type: 'email' },
      { field: 'is_active', required: false, type: 'boolean' }
    ];
  }
}