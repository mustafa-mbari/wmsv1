import { AuditableEntity } from '../base/AuditableEntity';
import { EntityId } from '../base/EntityId';
import { WarehouseName } from '../valueObjects/warehouse/WarehouseName';
import { WarehouseCode } from '../valueObjects/warehouse/WarehouseCode';
import { WarehouseType } from '../valueObjects/warehouse/WarehouseType';
import { WarehouseStatus } from '../valueObjects/warehouse/WarehouseStatus';
import { Address } from '../valueObjects/common/Address';
import { PhoneNumber } from '../valueObjects/common/PhoneNumber';
import { EmailAddress } from '../valueObjects/common/EmailAddress';
import { Dimensions } from '../valueObjects/common/Dimensions';
import { Weight } from '../valueObjects/common/Weight';
import { WarehouseCreatedEvent } from '../events/warehouse/WarehouseCreatedEvent';
import { WarehouseUpdatedEvent } from '../events/warehouse/WarehouseUpdatedEvent';
import { WarehouseStatusChangedEvent } from '../events/warehouse/WarehouseStatusChangedEvent';

export interface WarehouseOptions {
    description?: string;
    type?: WarehouseType;
    address?: Address;
    contactPerson?: string;
    email?: EmailAddress;
    phone?: PhoneNumber;
    totalArea?: number;
    areaUnit?: string;
    storageCapacity?: Weight;
    temperatureControlled?: boolean;
    minTemperature?: number;
    maxTemperature?: number;
    temperatureUnit?: string;
    status?: WarehouseStatus;
    isActive?: boolean;
    timezone?: string;
    operatingHours?: Record<string, any>;
    customAttributes?: Record<string, any>;
    latitude?: number;
    longitude?: number;
}

export class Warehouse extends AuditableEntity {
    private _name: WarehouseName;
    private _code: WarehouseCode;
    private _description?: string;
    private _type: WarehouseType;
    private _address?: Address;
    private _contactPerson?: string;
    private _email?: EmailAddress;
    private _phone?: PhoneNumber;
    private _totalArea?: number;
    private _areaUnit: string;
    private _storageCapacity?: Weight;
    private _temperatureControlled: boolean;
    private _minTemperature?: number;
    private _maxTemperature?: number;
    private _temperatureUnit: string;
    private _status: WarehouseStatus;
    private _isActive: boolean;
    private _timezone?: string;
    private _operatingHours?: Record<string, any>;
    private _customAttributes?: Record<string, any>;
    private _latitude?: number;
    private _longitude?: number;

    private constructor(
        id: EntityId,
        name: WarehouseName,
        code: WarehouseCode,
        options: WarehouseOptions = {},
        createdBy?: EntityId
    ) {
        super(id, createdBy);
        this._name = name;
        this._code = code;
        this._description = options.description;
        this._type = options.type || WarehouseType.distribution();
        this._address = options.address;
        this._contactPerson = options.contactPerson;
        this._email = options.email;
        this._phone = options.phone;
        this._totalArea = options.totalArea;
        this._areaUnit = options.areaUnit || 'sqm';
        this._storageCapacity = options.storageCapacity;
        this._temperatureControlled = options.temperatureControlled || false;
        this._minTemperature = options.minTemperature;
        this._maxTemperature = options.maxTemperature;
        this._temperatureUnit = options.temperatureUnit || 'celsius';
        this._status = options.status || WarehouseStatus.operational();
        this._isActive = options.isActive !== undefined ? options.isActive : true;
        this._timezone = options.timezone;
        this._operatingHours = options.operatingHours;
        this._customAttributes = options.customAttributes;
        this._latitude = options.latitude;
        this._longitude = options.longitude;
    }

    public static create(
        name: WarehouseName,
        code: WarehouseCode,
        options: WarehouseOptions = {},
        createdBy?: EntityId
    ): Warehouse {
        if (options.temperatureControlled) {
            if (options.minTemperature !== undefined && options.maxTemperature !== undefined &&
                options.minTemperature >= options.maxTemperature) {
                throw new Error('Minimum temperature must be less than maximum temperature');
            }
        }

        if (options.totalArea !== undefined && options.totalArea <= 0) {
            throw new Error('Total area must be positive');
        }

        if (options.latitude !== undefined && (options.latitude < -90 || options.latitude > 90)) {
            throw new Error('Latitude must be between -90 and 90');
        }

        if (options.longitude !== undefined && (options.longitude < -180 || options.longitude > 180)) {
            throw new Error('Longitude must be between -180 and 180');
        }

        const id = EntityId.create();
        const warehouse = new Warehouse(id, name, code, options, createdBy);

        warehouse.addEvent(new WarehouseCreatedEvent(
            id,
            name,
            code,
            warehouse._type,
            warehouse._status,
            createdBy,
            new Date()
        ));

        return warehouse;
    }

    // Getters
    get name(): WarehouseName { return this._name; }
    get code(): WarehouseCode { return this._code; }
    get description(): string | undefined { return this._description; }
    get type(): WarehouseType { return this._type; }
    get address(): Address | undefined { return this._address; }
    get contactPerson(): string | undefined { return this._contactPerson; }
    get email(): EmailAddress | undefined { return this._email; }
    get phone(): PhoneNumber | undefined { return this._phone; }
    get totalArea(): number | undefined { return this._totalArea; }
    get areaUnit(): string { return this._areaUnit; }
    get storageCapacity(): Weight | undefined { return this._storageCapacity; }
    get temperatureControlled(): boolean { return this._temperatureControlled; }
    get minTemperature(): number | undefined { return this._minTemperature; }
    get maxTemperature(): number | undefined { return this._maxTemperature; }
    get temperatureUnit(): string { return this._temperatureUnit; }
    get status(): WarehouseStatus { return this._status; }
    get isActive(): boolean { return this._isActive; }
    get timezone(): string | undefined { return this._timezone; }
    get operatingHours(): Record<string, any> | undefined { return this._operatingHours; }
    get customAttributes(): Record<string, any> | undefined { return this._customAttributes; }
    get latitude(): number | undefined { return this._latitude; }
    get longitude(): number | undefined { return this._longitude; }

    // Operations
    public updateInformation(data: {
        name?: WarehouseName;
        description?: string;
        contactPerson?: string;
        email?: EmailAddress;
        phone?: PhoneNumber;
        customAttributes?: Record<string, any>;
    }, updatedBy?: EntityId): void {
        const changes: Record<string, any> = {};

        if (data.name && !this._name.equals(data.name)) {
            this._name = data.name;
            changes.name = data.name.value;
        }

        if (data.description !== undefined && data.description !== this._description) {
            this._description = data.description;
            changes.description = data.description;
        }

        if (data.contactPerson !== undefined && data.contactPerson !== this._contactPerson) {
            this._contactPerson = data.contactPerson;
            changes.contactPerson = data.contactPerson;
        }

        if (data.email && (!this._email || !this._email.equals(data.email))) {
            this._email = data.email;
            changes.email = data.email.value;
        }

        if (data.phone && (!this._phone || !this._phone.equals(data.phone))) {
            this._phone = data.phone;
            changes.phone = data.phone.value;
        }

        if (data.customAttributes !== undefined) {
            this._customAttributes = data.customAttributes;
            changes.customAttributes = data.customAttributes;
        }

        if (Object.keys(changes).length > 0) {
            this.touch(updatedBy);
            this.addEvent(new WarehouseUpdatedEvent(
                this.id,
                changes,
                updatedBy,
                new Date()
            ));
        }
    }

    public updateAddress(address: Address, updatedBy?: EntityId): void {
        if (this._address?.equals(address)) {
            return;
        }

        this._address = address;
        this.touch(updatedBy);

        this.addEvent(new WarehouseUpdatedEvent(
            this.id,
            { address: address.toString() },
            updatedBy,
            new Date()
        ));
    }

    public updateLocation(latitude: number, longitude: number, updatedBy?: EntityId): void {
        if (latitude < -90 || latitude > 90) {
            throw new Error('Latitude must be between -90 and 90');
        }

        if (longitude < -180 || longitude > 180) {
            throw new Error('Longitude must be between -180 and 180');
        }

        if (this._latitude === latitude && this._longitude === longitude) {
            return;
        }

        this._latitude = latitude;
        this._longitude = longitude;
        this.touch(updatedBy);

        this.addEvent(new WarehouseUpdatedEvent(
            this.id,
            { latitude, longitude },
            updatedBy,
            new Date()
        ));
    }

    public updateCapacity(totalArea?: number, areaUnit?: string, storageCapacity?: Weight, updatedBy?: EntityId): void {
        if (totalArea !== undefined && totalArea <= 0) {
            throw new Error('Total area must be positive');
        }

        const changes: Record<string, any> = {};

        if (totalArea !== undefined && totalArea !== this._totalArea) {
            this._totalArea = totalArea;
            changes.totalArea = totalArea;
        }

        if (areaUnit && areaUnit !== this._areaUnit) {
            this._areaUnit = areaUnit;
            changes.areaUnit = areaUnit;
        }

        if (storageCapacity && (!this._storageCapacity || !this._storageCapacity.equals(storageCapacity))) {
            this._storageCapacity = storageCapacity;
            changes.storageCapacity = storageCapacity.toString();
        }

        if (Object.keys(changes).length > 0) {
            this.touch(updatedBy);
            this.addEvent(new WarehouseUpdatedEvent(
                this.id,
                changes,
                updatedBy,
                new Date()
            ));
        }
    }

    public updateTemperatureControl(
        enabled: boolean,
        minTemperature?: number,
        maxTemperature?: number,
        temperatureUnit?: string,
        updatedBy?: EntityId
    ): void {
        if (enabled && minTemperature !== undefined && maxTemperature !== undefined &&
            minTemperature >= maxTemperature) {
            throw new Error('Minimum temperature must be less than maximum temperature');
        }

        const changes: Record<string, any> = {};

        if (enabled !== this._temperatureControlled) {
            this._temperatureControlled = enabled;
            changes.temperatureControlled = enabled;
        }

        if (minTemperature !== undefined && minTemperature !== this._minTemperature) {
            this._minTemperature = minTemperature;
            changes.minTemperature = minTemperature;
        }

        if (maxTemperature !== undefined && maxTemperature !== this._maxTemperature) {
            this._maxTemperature = maxTemperature;
            changes.maxTemperature = maxTemperature;
        }

        if (temperatureUnit && temperatureUnit !== this._temperatureUnit) {
            this._temperatureUnit = temperatureUnit;
            changes.temperatureUnit = temperatureUnit;
        }

        if (Object.keys(changes).length > 0) {
            this.touch(updatedBy);
            this.addEvent(new WarehouseUpdatedEvent(
                this.id,
                changes,
                updatedBy,
                new Date()
            ));
        }
    }

    public updateOperatingHours(operatingHours: Record<string, any>, updatedBy?: EntityId): void {
        this._operatingHours = operatingHours;
        this.touch(updatedBy);

        this.addEvent(new WarehouseUpdatedEvent(
            this.id,
            { operatingHours },
            updatedBy,
            new Date()
        ));
    }

    public changeStatus(newStatus: WarehouseStatus, updatedBy?: EntityId): void {
        if (this._status.equals(newStatus)) {
            return;
        }

        if (!this._status.canTransitionTo(newStatus)) {
            throw new Error(`Cannot transition from ${this._status.value} to ${newStatus.value}`);
        }

        const previousStatus = this._status;
        this._status = newStatus;
        this.touch(updatedBy);

        this.addEvent(new WarehouseStatusChangedEvent(
            this.id,
            previousStatus,
            newStatus,
            updatedBy,
            new Date()
        ));
    }

    public activate(updatedBy?: EntityId): void {
        if (this._isActive) {
            return;
        }

        this._isActive = true;
        this.touch(updatedBy);

        this.addEvent(new WarehouseUpdatedEvent(
            this.id,
            { isActive: true },
            updatedBy,
            new Date()
        ));
    }

    public deactivate(updatedBy?: EntityId): void {
        if (!this._isActive) {
            return;
        }

        this._isActive = false;
        this.touch(updatedBy);

        this.addEvent(new WarehouseUpdatedEvent(
            this.id,
            { isActive: false },
            updatedBy,
            new Date()
        ));
    }

    // Business logic queries
    public isOperational(): boolean {
        return this._isActive && this._status.isOperational();
    }

    public canReceiveInventory(): boolean {
        return this.isOperational() && this._status.canReceiveInventory();
    }

    public canShipInventory(): boolean {
        return this.isOperational() && this._status.canShipInventory();
    }

    public hasTemperatureControl(): boolean {
        return this._temperatureControlled;
    }

    public isTemperatureInRange(temperature: number): boolean {
        if (!this._temperatureControlled) {
            return true; // No temperature restrictions
        }

        if (this._minTemperature !== undefined && temperature < this._minTemperature) {
            return false;
        }

        if (this._maxTemperature !== undefined && temperature > this._maxTemperature) {
            return false;
        }

        return true;
    }

    public getUtilization(usedArea: number): number {
        if (!this._totalArea || this._totalArea === 0) {
            return 0;
        }

        return Math.min(100, (usedArea / this._totalArea) * 100);
    }

    public getCapacityUtilization(usedCapacity: Weight): number {
        if (!this._storageCapacity) {
            return 0;
        }

        const usedInSameUnit = usedCapacity.convertTo(this._storageCapacity.unit);
        return Math.min(100, (usedInSameUnit.value / this._storageCapacity.value) * 100);
    }

    public getCoordinates(): { latitude: number; longitude: number } | null {
        if (this._latitude !== undefined && this._longitude !== undefined) {
            return { latitude: this._latitude, longitude: this._longitude };
        }
        return null;
    }

    public getDistanceTo(other: Warehouse): number | null {
        const thisCoords = this.getCoordinates();
        const otherCoords = other.getCoordinates();

        if (!thisCoords || !otherCoords) {
            return null;
        }

        // Haversine formula for calculating distance between two points on Earth
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(otherCoords.latitude - thisCoords.latitude);
        const dLon = this.toRadians(otherCoords.longitude - thisCoords.longitude);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(thisCoords.latitude)) *
                  Math.cos(this.toRadians(otherCoords.latitude)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    public validate(): string[] {
        const errors: string[] = [];

        if (this._temperatureControlled) {
            if (this._minTemperature !== undefined && this._maxTemperature !== undefined &&
                this._minTemperature >= this._maxTemperature) {
                errors.push('Minimum temperature must be less than maximum temperature');
            }
        }

        if (this._totalArea !== undefined && this._totalArea <= 0) {
            errors.push('Total area must be positive');
        }

        if (this._latitude !== undefined && (this._latitude < -90 || this._latitude > 90)) {
            errors.push('Latitude must be between -90 and 90');
        }

        if (this._longitude !== undefined && (this._longitude < -180 || this._longitude > 180)) {
            errors.push('Longitude must be between -180 and 180');
        }

        return errors;
    }
}