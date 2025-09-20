import { BaseException } from './BaseException';

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}

/**
 * Exception thrown when validation fails
 */
export class ValidationException extends BaseException {
    public readonly errors: ValidationError[];

    constructor(message: string, errors: ValidationError[] = []) {
        super(message, 'VALIDATION_ERROR', 400);
        this.errors = errors;
    }

    static fromSingleError(field: string, message: string, value?: any): ValidationException {
        return new ValidationException(
            `Validation failed for field '${field}': ${message}`,
            [{ field, message, value }]
        );
    }

    static fromMultipleErrors(errors: ValidationError[]): ValidationException {
        const fields = errors.map(e => e.field).join(', ');
        return new ValidationException(
            `Validation failed for fields: ${fields}`,
            errors
        );
    }

    addError(field: string, message: string, value?: any): void {
        this.errors.push({ field, message, value });
    }

    hasErrors(): boolean {
        return this.errors.length > 0;
    }

    getErrorsForField(field: string): ValidationError[] {
        return this.errors.filter(error => error.field === field);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            errors: this.errors
        };
    }
}