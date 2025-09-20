import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../base/EntityId';
import { InventoryStatus } from '../../valueObjects/inventory/InventoryStatus';

export class InventoryStatusChangedEvent extends DomainEvent {
    public readonly inventoryId: EntityId;
    public readonly productId: EntityId;
    public readonly locationId?: EntityId;
    public readonly previousStatus: InventoryStatus;
    public readonly newStatus: InventoryStatus;
    public readonly updatedBy?: EntityId;

    constructor(
        inventoryId: EntityId,
        productId: EntityId,
        locationId: EntityId | undefined,
        previousStatus: InventoryStatus,
        newStatus: InventoryStatus,
        updatedBy: EntityId | undefined,
        occurredAt: Date
    ) {
        super('InventoryStatusChanged', inventoryId, occurredAt);
        this.inventoryId = inventoryId;
        this.productId = productId;
        this.locationId = locationId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.updatedBy = updatedBy;
    }
}