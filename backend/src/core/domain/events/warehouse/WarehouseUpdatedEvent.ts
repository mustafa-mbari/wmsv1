import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../base/EntityId';

export class WarehouseUpdatedEvent extends DomainEvent {
    public readonly warehouseId: EntityId;
    public readonly changes: Record<string, any>;
    public readonly updatedBy?: EntityId;

    constructor(
        warehouseId: EntityId,
        changes: Record<string, any>,
        updatedBy: EntityId | undefined,
        occurredAt: Date
    ) {
        super('WarehouseUpdated', warehouseId, occurredAt);
        this.warehouseId = warehouseId;
        this.changes = changes;
        this.updatedBy = updatedBy;
    }
}