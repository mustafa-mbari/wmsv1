import { Result } from '../../../../utils/common/Result';
import { JsonReader } from './JsonReader';

/**
 * Validation rule interface
 */
export interface ValidationRule {
    field: string;
    required?: boolean;
    type?: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'url';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    unique?: boolean;
    customValidator?: (value: any, record: any) => boolean | string;
}

/**
 * Validation error
 */
export interface ValidationError {
    field: string;
    value: any;
    message: string;
    recordIndex: number;
}

/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: string[];
    recordCount: number;
}

/**
 * Seed data validator
 */
export class SeedValidator {
    /**
     * Validate seed data against rules
     */
    static async validateData<T = any>(
        data: T[],
        rules: ValidationRule[]
    ): Promise<Result<ValidationResult>> {
        try {
            const errors: ValidationError[] = [];
            const warnings: string[] = [];
            const uniqueValues: { [field: string]: Set<any> } = {};

            // Initialize unique value tracking
            rules.filter(rule => rule.unique).forEach(rule => {
                uniqueValues[rule.field] = new Set();
            });

            // Validate each record
            for (let i = 0; i < data.length; i++) {
                const record = data[i];

                for (const rule of rules) {
                    const fieldErrors = this.validateField(record, rule, i, uniqueValues);
                    errors.push(...fieldErrors);
                }
            }

            const result: ValidationResult = {
                valid: errors.length === 0,
                errors,
                warnings,
                recordCount: data.length
            };

            return Result.ok(result);

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return Result.fail(`Validation failed: ${message}`);
        }
    }

    /**
     * Validate a JSON file
     */
    static async validateJsonFile(
        filePath: string,
        rules: ValidationRule[]
    ): Promise<Result<ValidationResult>> {
        try {
            const dataResult = await JsonReader.read(filePath);
            if (dataResult.isFailure) {
                return Result.fail(dataResult.error!);
            }

            return await this.validateData(dataResult.getValue(), rules);

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return Result.fail(`File validation failed: ${message}`);
        }
    }

    /**
     * Validate a single field
     */
    private static validateField(
        record: any,
        rule: ValidationRule,
        recordIndex: number,
        uniqueValues: { [field: string]: Set<any> }
    ): ValidationError[] {
        const errors: ValidationError[] = [];
        const value = record[rule.field];

        // Required validation
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push({
                field: rule.field,
                value,
                message: `Field '${rule.field}' is required`,
                recordIndex
            });
            return errors; // Skip other validations if required field is missing
        }

        // Skip other validations if value is empty and not required
        if (value === undefined || value === null || value === '') {
            return errors;
        }

        // Type validation
        if (rule.type) {
            const typeError = this.validateType(value, rule.type, rule.field, recordIndex);
            if (typeError) {
                errors.push(typeError);
            }
        }

        // String validations
        if (typeof value === 'string') {
            if (rule.minLength && value.length < rule.minLength) {
                errors.push({
                    field: rule.field,
                    value,
                    message: `Field '${rule.field}' must be at least ${rule.minLength} characters`,
                    recordIndex
                });
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push({
                    field: rule.field,
                    value,
                    message: `Field '${rule.field}' must be at most ${rule.maxLength} characters`,
                    recordIndex
                });
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push({
                    field: rule.field,
                    value,
                    message: `Field '${rule.field}' does not match required pattern`,
                    recordIndex
                });
            }
        }

        // Number validations
        if (typeof value === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                errors.push({
                    field: rule.field,
                    value,
                    message: `Field '${rule.field}' must be at least ${rule.min}`,
                    recordIndex
                });
            }

            if (rule.max !== undefined && value > rule.max) {
                errors.push({
                    field: rule.field,
                    value,
                    message: `Field '${rule.field}' must be at most ${rule.max}`,
                    recordIndex
                });
            }
        }

        // Unique validation
        if (rule.unique) {
            const uniqueSet = uniqueValues[rule.field];
            if (uniqueSet.has(value)) {
                errors.push({
                    field: rule.field,
                    value,
                    message: `Field '${rule.field}' must be unique. Duplicate value: ${value}`,
                    recordIndex
                });
            } else {
                uniqueSet.add(value);
            }
        }

        // Custom validation
        if (rule.customValidator) {
            const customResult = rule.customValidator(value, record);
            if (customResult !== true) {
                const message = typeof customResult === 'string'
                    ? customResult
                    : `Field '${rule.field}' failed custom validation`;

                errors.push({
                    field: rule.field,
                    value,
                    message,
                    recordIndex
                });
            }
        }

        return errors;
    }

    /**
     * Validate field type
     */
    private static validateType(
        value: any,
        expectedType: string,
        fieldName: string,
        recordIndex: number
    ): ValidationError | null {
        switch (expectedType) {
            case 'string':
                if (typeof value !== 'string') {
                    return {
                        field: fieldName,
                        value,
                        message: `Field '${fieldName}' must be a string`,
                        recordIndex
                    };
                }
                break;

            case 'number':
                if (typeof value !== 'number' || isNaN(value)) {
                    return {
                        field: fieldName,
                        value,
                        message: `Field '${fieldName}' must be a number`,
                        recordIndex
                    };
                }
                break;

            case 'boolean':
                if (typeof value !== 'boolean') {
                    return {
                        field: fieldName,
                        value,
                        message: `Field '${fieldName}' must be a boolean`,
                        recordIndex
                    };
                }
                break;

            case 'date':
                const date = new Date(value);
                if (isNaN(date.getTime())) {
                    return {
                        field: fieldName,
                        value,
                        message: `Field '${fieldName}' must be a valid date`,
                        recordIndex
                    };
                }
                break;

            case 'email':
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (typeof value !== 'string' || !emailPattern.test(value)) {
                    return {
                        field: fieldName,
                        value,
                        message: `Field '${fieldName}' must be a valid email address`,
                        recordIndex
                    };
                }
                break;

            case 'url':
                try {
                    new URL(value);
                } catch {
                    return {
                        field: fieldName,
                        value,
                        message: `Field '${fieldName}' must be a valid URL`,
                        recordIndex
                    };
                }
                break;
        }

        return null;
    }

    /**
     * Create common validation rules for audit fields
     */
    static getAuditFieldRules(): ValidationRule[] {
        return [
            { field: 'created_at', type: 'date' },
            { field: 'updated_at', type: 'date' },
            { field: 'deleted_at', type: 'date' },
            { field: 'created_by', type: 'number' },
            { field: 'updated_by', type: 'number' },
            { field: 'deleted_by', type: 'number' }
        ];
    }

    /**
     * Format validation result for logging
     */
    static formatValidationResult(result: ValidationResult): string {
        if (result.valid) {
            return `✅ Validation passed: ${result.recordCount} records validated`;
        }

        let output = `❌ Validation failed: ${result.errors.length} errors found in ${result.recordCount} records\n`;

        // Group errors by field
        const errorsByField = result.errors.reduce((acc, error) => {
            if (!acc[error.field]) {
                acc[error.field] = [];
            }
            acc[error.field].push(error);
            return acc;
        }, {} as { [field: string]: ValidationError[] });

        Object.entries(errorsByField).forEach(([field, errors]) => {
            output += `\n  ${field}: ${errors.length} errors\n`;
            errors.slice(0, 3).forEach(error => {
                output += `    • Record ${error.recordIndex}: ${error.message}\n`;
            });
            if (errors.length > 3) {
                output += `    • ... and ${errors.length - 3} more\n`;
            }
        });

        return output;
    }
}