import { DomainEvent } from '../../base/DomainEvent';
import { EntityId } from '../../valueObjects/common/EntityId';

export class ProductUpdatedEvent extends DomainEvent {
    constructor(
        productId: EntityId,
        public readonly changes: Record<string, any>,
        public readonly updatedBy?: EntityId
    ) {
        super(productId, 'ProductUpdated');
    }
}