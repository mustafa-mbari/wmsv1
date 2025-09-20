import { AuditableEntity } from '../base/AuditableEntity';
import { EntityId } from '../base/EntityId';
import { Weight } from '../valueObjects/common/Weight';
import { Dimensions } from '../valueObjects/common/Dimensions';
import { InventoryStatus } from '../valueObjects/inventory/InventoryStatus';
import { QualityStatus } from '../valueObjects/inventory/QualityStatus';
import { LotNumber } from '../valueObjects/inventory/LotNumber';
import { SerialNumber } from '../valueObjects/inventory/SerialNumber';
import { InventoryCreatedEvent } from '../events/inventory/InventoryCreatedEvent';
import { InventoryUpdatedEvent } from '../events/inventory/InventoryUpdatedEvent';
import { InventoryStockChangedEvent } from '../events/inventory/InventoryStockChangedEvent';
import { InventoryStatusChangedEvent } from '../events/inventory/InventoryStatusChangedEvent';

export interface InventoryOptions {
    locationId?: EntityId;
    uomId?: EntityId;
    minStockLevel?: number;
    maxStockLevel?: number;
    reorderPoint?: number;
    lotNumber?: LotNumber;
    serialNumber?: SerialNumber;
    productionDate?: Date;
    expiryDate?: Date;
    lastMovementDate?: Date;
    status?: InventoryStatus;
    isActive?: boolean;
    qualityStatus?: QualityStatus;
    temperatureZone?: string;
    weight?: Weight;
    dimensions?: Dimensions;
    hazardClass?: string;
    ownerId?: EntityId;
    supplierId?: EntityId;
    customsInfo?: Record<string, any>;
    barcode?: string;
    rfidTag?: string;
    lastAuditDate?: Date;
    auditNotes?: string;
    approvalDate?: Date;
    approvedBy?: EntityId;
}

export class Inventory extends AuditableEntity {
    private _productId: EntityId;
    private _locationId?: EntityId;
    private _quantity: number;
    private _uomId?: EntityId;
    private _minStockLevel: number;
    private _maxStockLevel: number;
    private _reorderPoint: number;
    private _lotNumber?: LotNumber;
    private _serialNumber?: SerialNumber;
    private _productionDate?: Date;
    private _expiryDate?: Date;
    private _lastMovementDate?: Date;
    private _status: InventoryStatus;
    private _isActive: boolean;
    private _qualityStatus: QualityStatus;
    private _temperatureZone?: string;
    private _weight?: Weight;
    private _dimensions?: Dimensions;
    private _hazardClass?: string;
    private _ownerId?: EntityId;
    private _supplierId?: EntityId;
    private _customsInfo?: Record<string, any>;
    private _barcode?: string;
    private _rfidTag?: string;
    private _lastAuditDate?: Date;
    private _auditNotes?: string;
    private _approvalDate?: Date;
    private _approvedBy?: EntityId;

    private constructor(
        id: EntityId,
        productId: EntityId,
        quantity: number,
        options: InventoryOptions = {},
        createdBy?: EntityId
    ) {
        super(id, createdBy);
        this._productId = productId;
        this._quantity = quantity;
        this._locationId = options.locationId;
        this._uomId = options.uomId;
        this._minStockLevel = options.minStockLevel || 0;
        this._maxStockLevel = options.maxStockLevel || 1000;
        this._reorderPoint = options.reorderPoint || 0;
        this._lotNumber = options.lotNumber;
        this._serialNumber = options.serialNumber;
        this._productionDate = options.productionDate;
        this._expiryDate = options.expiryDate;
        this._lastMovementDate = options.lastMovementDate;
        this._status = options.status || InventoryStatus.available();
        this._isActive = options.isActive !== undefined ? options.isActive : true;
        this._qualityStatus = options.qualityStatus || QualityStatus.good();
        this._temperatureZone = options.temperatureZone;
        this._weight = options.weight;
        this._dimensions = options.dimensions;
        this._hazardClass = options.hazardClass;
        this._ownerId = options.ownerId;
        this._supplierId = options.supplierId;
        this._customsInfo = options.customsInfo;
        this._barcode = options.barcode;
        this._rfidTag = options.rfidTag;
        this._lastAuditDate = options.lastAuditDate;
        this._auditNotes = options.auditNotes;
        this._approvalDate = options.approvalDate;
        this._approvedBy = options.approvedBy;
    }

    public static create(
        productId: EntityId,
        quantity: number,
        options: InventoryOptions = {},
        createdBy?: EntityId
    ): Inventory {
        if (quantity < 0) {
            throw new Error('Inventory quantity cannot be negative');
        }

        if (options.minStockLevel !== undefined && options.minStockLevel < 0) {
            throw new Error('Minimum stock level cannot be negative');
        }

        if (options.maxStockLevel !== undefined && options.maxStockLevel < 0) {
            throw new Error('Maximum stock level cannot be negative');
        }

        if (options.minStockLevel !== undefined && options.maxStockLevel !== undefined &&
            options.minStockLevel > options.maxStockLevel) {
            throw new Error('Minimum stock level cannot be greater than maximum stock level');
        }

        if (options.expiryDate && options.productionDate &&
            options.expiryDate <= options.productionDate) {
            throw new Error('Expiry date must be after production date');
        }

        const id = EntityId.create();
        const inventory = new Inventory(id, productId, quantity, options, createdBy);

        inventory.addEvent(new InventoryCreatedEvent(
            id,
            productId,
            quantity,
            options.locationId,
            inventory._status,
            createdBy,
            new Date()
        ));

        return inventory;
    }

    // Getters
    get productId(): EntityId { return this._productId; }
    get locationId(): EntityId | undefined { return this._locationId; }
    get quantity(): number { return this._quantity; }
    get uomId(): EntityId | undefined { return this._uomId; }
    get minStockLevel(): number { return this._minStockLevel; }
    get maxStockLevel(): number { return this._maxStockLevel; }
    get reorderPoint(): number { return this._reorderPoint; }
    get lotNumber(): LotNumber | undefined { return this._lotNumber; }
    get serialNumber(): SerialNumber | undefined { return this._serialNumber; }
    get productionDate(): Date | undefined { return this._productionDate; }
    get expiryDate(): Date | undefined { return this._expiryDate; }
    get lastMovementDate(): Date | undefined { return this._lastMovementDate; }
    get status(): InventoryStatus { return this._status; }
    get isActive(): boolean { return this._isActive; }
    get qualityStatus(): QualityStatus { return this._qualityStatus; }
    get temperatureZone(): string | undefined { return this._temperatureZone; }
    get weight(): Weight | undefined { return this._weight; }
    get dimensions(): Dimensions | undefined { return this._dimensions; }
    get hazardClass(): string | undefined { return this._hazardClass; }
    get ownerId(): EntityId | undefined { return this._ownerId; }
    get supplierId(): EntityId | undefined { return this._supplierId; }
    get customsInfo(): Record<string, any> | undefined { return this._customsInfo; }
    get barcode(): string | undefined { return this._barcode; }
    get rfidTag(): string | undefined { return this._rfidTag; }
    get lastAuditDate(): Date | undefined { return this._lastAuditDate; }
    get auditNotes(): string | undefined { return this._auditNotes; }
    get approvalDate(): Date | undefined { return this._approvalDate; }
    get approvedBy(): EntityId | undefined { return this._approvedBy; }

    // Stock operations
    public addStock(quantity: number, updatedBy?: EntityId): void {
        if (quantity <= 0) {
            throw new Error('Added quantity must be positive');
        }

        if (!this._isActive) {
            throw new Error('Cannot add stock to inactive inventory');
        }

        const previousQuantity = this._quantity;
        this._quantity += quantity;
        this._lastMovementDate = new Date();
        this.touch(updatedBy);

        this.addEvent(new InventoryStockChangedEvent(
            this.id,
            this._productId,
            this._locationId,
            'add',
            quantity,
            previousQuantity,
            this._quantity,
            updatedBy,
            new Date()
        ));
    }

    public removeStock(quantity: number, updatedBy?: EntityId): void {
        if (quantity <= 0) {
            throw new Error('Removed quantity must be positive');
        }

        if (quantity > this._quantity) {
            throw new Error('Cannot remove more stock than available');
        }

        if (!this._isActive) {
            throw new Error('Cannot remove stock from inactive inventory');
        }

        const previousQuantity = this._quantity;
        this._quantity -= quantity;
        this._lastMovementDate = new Date();
        this.touch(updatedBy);

        this.addEvent(new InventoryStockChangedEvent(
            this.id,
            this._productId,
            this._locationId,
            'remove',
            quantity,
            previousQuantity,
            this._quantity,
            updatedBy,
            new Date()
        ));
    }

    public setStock(quantity: number, updatedBy?: EntityId): void {
        if (quantity < 0) {
            throw new Error('Stock quantity cannot be negative');
        }

        if (!this._isActive) {
            throw new Error('Cannot set stock for inactive inventory');
        }

        const previousQuantity = this._quantity;
        const operation = quantity > previousQuantity ? 'add' : 'remove';
        const changeAmount = Math.abs(quantity - previousQuantity);

        this._quantity = quantity;
        this._lastMovementDate = new Date();
        this.touch(updatedBy);

        if (changeAmount > 0) {
            this.addEvent(new InventoryStockChangedEvent(
                this.id,
                this._productId,
                this._locationId,
                operation,
                changeAmount,
                previousQuantity,
                this._quantity,
                updatedBy,
                new Date()
            ));
        }
    }

    // Status operations
    public changeStatus(newStatus: InventoryStatus, updatedBy?: EntityId): void {
        if (this._status.equals(newStatus)) {
            return;
        }

        if (!this._status.canTransitionTo(newStatus)) {
            throw new Error(`Cannot transition from ${this._status.value} to ${newStatus.value}`);
        }

        const previousStatus = this._status;
        this._status = newStatus;
        this.touch(updatedBy);

        this.addEvent(new InventoryStatusChangedEvent(
            this.id,
            this._productId,
            this._locationId,
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

        this.addEvent(new InventoryUpdatedEvent(
            this.id,
            this._productId,
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

        this.addEvent(new InventoryUpdatedEvent(
            this.id,
            this._productId,
            { isActive: false },
            updatedBy,
            new Date()
        ));
    }

    // Information updates
    public updateLocation(locationId: EntityId, updatedBy?: EntityId): void {
        if (this._locationId?.equals(locationId)) {
            return;
        }

        this._locationId = locationId;
        this.touch(updatedBy);

        this.addEvent(new InventoryUpdatedEvent(
            this.id,
            this._productId,
            { locationId: locationId.value },
            updatedBy,
            new Date()
        ));
    }

    public updateStockLevels(minLevel: number, maxLevel: number, reorderPoint: number, updatedBy?: EntityId): void {
        if (minLevel < 0 || maxLevel < 0 || reorderPoint < 0) {
            throw new Error('Stock levels cannot be negative');
        }

        if (minLevel > maxLevel) {
            throw new Error('Minimum stock level cannot be greater than maximum stock level');
        }

        this._minStockLevel = minLevel;
        this._maxStockLevel = maxLevel;
        this._reorderPoint = reorderPoint;
        this.touch(updatedBy);

        this.addEvent(new InventoryUpdatedEvent(
            this.id,
            this._productId,
            { minStockLevel: minLevel, maxStockLevel: maxLevel, reorderPoint },
            updatedBy,
            new Date()
        ));
    }

    public updateQualityStatus(qualityStatus: QualityStatus, updatedBy?: EntityId): void {
        if (this._qualityStatus.equals(qualityStatus)) {
            return;
        }

        this._qualityStatus = qualityStatus;
        this.touch(updatedBy);

        this.addEvent(new InventoryUpdatedEvent(
            this.id,
            this._productId,
            { qualityStatus: qualityStatus.value },
            updatedBy,
            new Date()
        ));
    }

    public updatePhysicalProperties(weight?: Weight, dimensions?: Dimensions, updatedBy?: EntityId): void {
        this._weight = weight;
        this._dimensions = dimensions;
        this.touch(updatedBy);

        this.addEvent(new InventoryUpdatedEvent(
            this.id,
            this._productId,
            { weight: weight?.toString(), dimensions: dimensions?.toString() },
            updatedBy,
            new Date()
        ));
    }

    public updateAuditInfo(auditNotes: string, updatedBy?: EntityId): void {
        this._lastAuditDate = new Date();
        this._auditNotes = auditNotes;
        this.touch(updatedBy);

        this.addEvent(new InventoryUpdatedEvent(
            this.id,
            this._productId,
            { lastAuditDate: this._lastAuditDate, auditNotes },
            updatedBy,
            new Date()
        ));
    }

    // Business logic queries
    public isLowStock(): boolean {
        return this._quantity <= this._reorderPoint;
    }

    public isOutOfStock(): boolean {
        return this._quantity === 0;
    }

    public isOverStock(): boolean {
        return this._quantity > this._maxStockLevel;
    }

    public isExpired(): boolean {
        if (!this._expiryDate) {
            return false;
        }
        return this._expiryDate <= new Date();
    }

    public daysUntilExpiry(): number | null {
        if (!this._expiryDate) {
            return null;
        }
        const diffTime = this._expiryDate.getTime() - new Date().getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    public isExpiringSoon(days: number = 30): boolean {
        const daysUntilExpiry = this.daysUntilExpiry();
        return daysUntilExpiry !== null && daysUntilExpiry <= days && daysUntilExpiry > 0;
    }

    public canBeReserved(quantity: number): boolean {
        return this._isActive &&
               this._status.isAvailable() &&
               !this._qualityStatus.isRejected() &&
               this._quantity >= quantity &&
               !this.isExpired();
    }

    public canBeMoved(): boolean {
        return this._isActive &&
               this._status.canBeMoved() &&
               !this._qualityStatus.isQuarantined();
    }

    public requiresSpecialHandling(): boolean {
        return !!this._hazardClass ||
               !!this._temperatureZone ||
               (this._weight && this._weight.requiresSpecialHandling());
    }

    public getStockStatus(): 'out_of_stock' | 'low_stock' | 'normal' | 'overstock' {
        if (this.isOutOfStock()) return 'out_of_stock';
        if (this.isLowStock()) return 'low_stock';
        if (this.isOverStock()) return 'overstock';
        return 'normal';
    }

    public getAvailableQuantity(): number {
        if (!this._isActive || !this._status.isAvailable() || this.isExpired()) {
            return 0;
        }
        return this._quantity;
    }

    public validate(): string[] {
        const errors: string[] = [];

        if (this._quantity < 0) {
            errors.push('Quantity cannot be negative');
        }

        if (this._minStockLevel < 0) {
            errors.push('Minimum stock level cannot be negative');
        }

        if (this._maxStockLevel < 0) {
            errors.push('Maximum stock level cannot be negative');
        }

        if (this._minStockLevel > this._maxStockLevel) {
            errors.push('Minimum stock level cannot be greater than maximum stock level');
        }

        if (this._expiryDate && this._productionDate && this._expiryDate <= this._productionDate) {
            errors.push('Expiry date must be after production date');
        }

        return errors;
    }
}