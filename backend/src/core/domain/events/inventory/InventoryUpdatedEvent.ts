import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../base/EntityId';

export class InventoryUpdatedEvent extends DomainEvent {
    public readonly inventoryId: EntityId;
    public readonly productId: EntityId;
    public readonly changes: Record<string, any>;
    public readonly updatedBy?: EntityId;

    constructor(
        inventoryId: EntityId,
        productId: EntityId,
        changes: Record<string, any>,
        updatedBy: EntityId | undefined,
        occurredAt: Date
    ) {
        super('InventoryUpdated', inventoryId, occurredAt);
        this.inventoryId = inventoryId;
        this.productId = productId;
        this.changes = changes;
        this.updatedBy = updatedBy;
    }
}