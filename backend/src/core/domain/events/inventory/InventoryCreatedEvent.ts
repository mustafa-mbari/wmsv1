import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../base/EntityId';
import { InventoryStatus } from '../../valueObjects/inventory/InventoryStatus';

export class InventoryCreatedEvent extends DomainEvent {
    public readonly inventoryId: EntityId;
    public readonly productId: EntityId;
    public readonly quantity: number;
    public readonly locationId?: EntityId;
    public readonly status: InventoryStatus;
    public readonly createdBy?: EntityId;

    constructor(
        inventoryId: EntityId,
        productId: EntityId,
        quantity: number,
        locationId: EntityId | undefined,
        status: InventoryStatus,
        createdBy: EntityId | undefined,
        occurredAt: Date
    ) {
        super('InventoryCreated', inventoryId, occurredAt);
        this.inventoryId = inventoryId;
        this.productId = productId;
        this.quantity = quantity;
        this.locationId = locationId;
        this.status = status;
        this.createdBy = createdBy;
    }
}