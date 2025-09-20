/**
 * Either type for representing a value that can be one of two types
 */
export abstract class Either<L, R> {
    /**
     * Creates a Left (error) value
     */
    public static left<L, R>(value: L): Either<L, R> {
        return new Left(value);
    }

    /**
     * Creates a Right (success) value
     */
    public static right<L, R>(value: R): Either<L, R> {
        return new Right(value);
    }

    /**
     * Returns true if this is a Left value
     */
    public abstract isLeft(): boolean;

    /**
     * Returns true if this is a Right value
     */
    public abstract isRight(): boolean;

    /**
     * Maps the right value if it exists
     */
    public abstract map<U>(fn: (value: R) => U): Either<L, U>;

    /**
     * Maps the left value if it exists
     */
    public abstract mapLeft<U>(fn: (value: L) => U): Either<U, R>;

    /**
     * Flat maps the right value if it exists
     */
    public abstract flatMap<U>(fn: (value: R) => Either<L, U>): Either<L, U>;

    /**
     * Executes a function on the right value if it exists
     */
    public abstract fold<U>(leftFn: (left: L) => U, rightFn: (right: R) => U): U;

    /**
     * Gets the right value or throws an error
     */
    public abstract getOrThrow(errorMessage?: string): R;

    /**
     * Gets the right value or returns a default
     */
    public abstract getOrDefault(defaultValue: R): R;
}

/**
 * Left implementation (represents error/failure)
 */
class Left<L, R> extends Either<L, R> {
    constructor(private readonly value: L) {
        super();
    }

    public isLeft(): boolean {
        return true;
    }

    public isRight(): boolean {
        return false;
    }

    public map<U>(_fn: (value: R) => U): Either<L, U> {
        return new Left<L, U>(this.value);
    }

    public mapLeft<U>(fn: (value: L) => U): Either<U, R> {
        return new Left<U, R>(fn(this.value));
    }

    public flatMap<U>(_fn: (value: R) => Either<L, U>): Either<L, U> {
        return new Left<L, U>(this.value);
    }

    public fold<U>(leftFn: (left: L) => U, _rightFn: (right: R) => U): U {
        return leftFn(this.value);
    }

    public getOrThrow(errorMessage?: string): R {
        throw new Error(errorMessage || `Cannot get Right value from Left: ${this.value}`);
    }

    public getOrDefault(defaultValue: R): R {
        return defaultValue;
    }

    public getValue(): L {
        return this.value;
    }
}

/**
 * Right implementation (represents success)
 */
class Right<L, R> extends Either<L, R> {
    constructor(private readonly value: R) {
        super();
    }

    public isLeft(): boolean {
        return false;
    }

    public isRight(): boolean {
        return true;
    }

    public map<U>(fn: (value: R) => U): Either<L, U> {
        return new Right<L, U>(fn(this.value));
    }

    public mapLeft<U>(_fn: (value: L) => U): Either<U, R> {
        return new Right<U, R>(this.value);
    }

    public flatMap<U>(fn: (value: R) => Either<L, U>): Either<L, U> {
        return fn(this.value);
    }

    public fold<U>(_leftFn: (left: L) => U, rightFn: (right: R) => U): U {
        return rightFn(this.value);
    }

    public getOrThrow(_errorMessage?: string): R {
        return this.value;
    }

    public getOrDefault(_defaultValue: R): R {
        return this.value;
    }

    public getValue(): R {
        return this.value;
    }
}