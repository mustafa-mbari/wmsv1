/**
 * Base exception class for all custom exceptions
 */
export abstract class BaseException extends Error {
    public readonly code: string;
    public readonly statusCode: number;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        code: string,
        statusCode: number = 500,
        isOperational: boolean = true
    ) {
        super(message);

        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        Object.setPrototypeOf(this, BaseException.prototype);
    }

    /**
     * Convert exception to JSON format
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            stack: this.stack
        };
    }
}