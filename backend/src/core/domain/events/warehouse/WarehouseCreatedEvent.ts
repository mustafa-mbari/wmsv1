import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../base/EntityId';
import { WarehouseName } from '../../valueObjects/warehouse/WarehouseName';
import { WarehouseCode } from '../../valueObjects/warehouse/WarehouseCode';
import { WarehouseType } from '../../valueObjects/warehouse/WarehouseType';
import { WarehouseStatus } from '../../valueObjects/warehouse/WarehouseStatus';

export class WarehouseCreatedEvent extends DomainEvent {
    public readonly warehouseId: EntityId;
    public readonly name: WarehouseName;
    public readonly code: WarehouseCode;
    public readonly type: WarehouseType;
    public readonly status: WarehouseStatus;
    public readonly createdBy?: EntityId;

    constructor(
        warehouseId: EntityId,
        name: WarehouseName,
        code: WarehouseCode,
        type: WarehouseType,
        status: WarehouseStatus,
        createdBy: EntityId | undefined,
        occurredAt: Date
    ) {
        super('WarehouseCreated', warehouseId, occurredAt);
        this.warehouseId = warehouseId;
        this.name = name;
        this.code = code;
        this.type = type;
        this.status = status;
        this.createdBy = createdBy;
    }
}