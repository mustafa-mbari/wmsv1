import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class EntityId {
    private readonly _value: string;

    constructor(value?: string) {
        if (value) {
            if (!this.isValid(value)) {
                throw new Error(`Invalid EntityId format: ${value}`);
            }
            this._value = value;
        } else {
            this._value = uuidv4();
        }
    }

    public get value(): string {
        return this._value;
    }

    private isValid(value: string): boolean {
        return uuidValidate(value);
    }

    public equals(other: EntityId): boolean {
        return this._value === other._value;
    }

    public toString(): string {
        return this._value;
    }

    public static generate(): EntityId {
        return new EntityId();
    }

    public static fromString(value: string): EntityId {
        return new EntityId(value);
    }
}