import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../base/EntityId';
import { WarehouseStatus } from '../../valueObjects/warehouse/WarehouseStatus';

export class WarehouseStatusChangedEvent extends DomainEvent {
    public readonly warehouseId: EntityId;
    public readonly previousStatus: WarehouseStatus;
    public readonly newStatus: WarehouseStatus;
    public readonly updatedBy?: EntityId;

    constructor(
        warehouseId: EntityId,
        previousStatus: WarehouseStatus,
        newStatus: WarehouseStatus,
        updatedBy: EntityId | undefined,
        occurredAt: Date
    ) {
        super('WarehouseStatusChanged', warehouseId, occurredAt);
        this.warehouseId = warehouseId;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.updatedBy = updatedBy;
    }
}