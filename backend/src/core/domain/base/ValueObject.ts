export abstract class ValueObject<T> {
    protected readonly _value: T;

    constructor(value: T) {
        this._value = Object.freeze(value);
    }

    public get value(): T {
        return this._value;
    }

    public equals(other: ValueObject<T>): boolean {
        if (other === null || other === undefined) {
            return false;
        }

        if (this.constructor !== other.constructor) {
            return false;
        }

        return this.isEqual(other);
    }

    protected abstract isEqual(other: ValueObject<T>): boolean;

    public toString(): string {
        return String(this._value);
    }
}