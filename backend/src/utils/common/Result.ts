/**
 * Result pattern implementation for handling success/failure scenarios
 */
export class Result<T> {
    public readonly isSuccess: boolean;
    public readonly isFailure: boolean;
    public readonly error?: string;
    public readonly errorCode?: string;
    private readonly _value?: T;

    private constructor(
        isSuccess: boolean,
        error?: string,
        value?: T,
        errorCode?: string
    ) {
        if (isSuccess && error) {
            throw new Error('InvalidOperation: A result cannot be successful and contain an error');
        }
        if (!isSuccess && !error) {
            throw new Error('InvalidOperation: A failing result needs to contain an error message');
        }

        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this.errorCode = errorCode;
        this._value = value;

        Object.freeze(this);
    }

    public getValue(): T {
        if (!this.isSuccess) {
            throw new Error('Cannot get the value of an error result. Use errorValue instead.');
        }

        if (this._value === undefined) {
            throw new Error('Cannot get the value of a successful result that has no value.');
        }

        return this._value;
    }

    public getValueOrDefault(defaultValue: T): T {
        return this.isSuccess && this._value !== undefined ? this._value : defaultValue;
    }

    public getValueOrNull(): T | null {
        return this.isSuccess && this._value !== undefined ? this._value : null;
    }

    public static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, undefined, value);
    }

    public static fail<U>(error: string, errorCode?: string): Result<U> {
        return new Result<U>(false, error, undefined, errorCode);
    }

    public static combine(results: Result<any>[]): Result<any> {
        for (const result of results) {
            if (result.isFailure) {
                return result;
            }
        }
        return Result.ok();
    }

    public static combineWithError(results: Result<any>[]): Result<string[]> {
        const failed = results.filter(r => r.isFailure);
        if (failed.length === 0) {
            return Result.ok();
        }

        const errors = failed.map(r => r.error!);
        return Result.fail(`Multiple errors occurred: ${errors.join(', ')}`);
    }

    /**
     * Maps the value of a successful result to a new result
     */
    public map<U>(mapper: (value: T) => U): Result<U> {
        if (this.isFailure) {
            return Result.fail<U>(this.error!, this.errorCode);
        }

        try {
            const mappedValue = mapper(this.getValue());
            return Result.ok(mappedValue);
        } catch (error) {
            return Result.fail<U>(`Mapping failed: ${error}`);
        }
    }

    /**
     * Flat maps the value of a successful result to a new result
     */
    public flatMap<U>(mapper: (value: T) => Result<U>): Result<U> {
        if (this.isFailure) {
            return Result.fail<U>(this.error!, this.errorCode);
        }

        try {
            return mapper(this.getValue());
        } catch (error) {
            return Result.fail<U>(`Flat mapping failed: ${error}`);
        }
    }

    /**
     * Executes a function if the result is successful
     */
    public onSuccess(action: (value: T) => void): Result<T> {
        if (this.isSuccess) {
            action(this.getValue());
        }
        return this;
    }

    /**
     * Executes a function if the result is failure
     */
    public onFailure(action: (error: string, errorCode?: string) => void): Result<T> {
        if (this.isFailure) {
            action(this.error!, this.errorCode);
        }
        return this;
    }
}

/**
 * Type guard to check if a result is successful
 */
export function isSuccess<T>(result: Result<T>): result is Result<T> & { getValue(): T } {
    return result.isSuccess;
}

/**
 * Type guard to check if a result is failure
 */
export function isFailure<T>(result: Result<T>): result is Result<T> & { error: string } {
    return result.isFailure;
}