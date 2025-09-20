import { DomainEvent } from '../../base/DomainEvent';
import { EntityId } from '../../valueObjects/common/EntityId';

export class ProductCreatedEvent extends DomainEvent {
    constructor(
        productId: EntityId,
        public readonly productName: string,
        public readonly productSku: string,
        public readonly price: number,
        public readonly createdBy?: EntityId
    ) {
        super(productId, 'ProductCreated');
    }
}