import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../base/EntityId';

export class InventoryStockChangedEvent extends DomainEvent {
    public readonly inventoryId: EntityId;
    public readonly productId: EntityId;
    public readonly locationId?: EntityId;
    public readonly operation: 'add' | 'remove';
    public readonly quantity: number;
    public readonly previousQuantity: number;
    public readonly newQuantity: number;
    public readonly updatedBy?: EntityId;

    constructor(
        inventoryId: EntityId,
        productId: EntityId,
        locationId: EntityId | undefined,
        operation: 'add' | 'remove',
        quantity: number,
        previousQuantity: number,
        newQuantity: number,
        updatedBy: EntityId | undefined,
        occurredAt: Date
    ) {
        super('InventoryStockChanged', inventoryId, occurredAt);
        this.inventoryId = inventoryId;
        this.productId = productId;
        this.locationId = locationId;
        this.operation = operation;
        this.quantity = quantity;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.updatedBy = updatedBy;
    }
}