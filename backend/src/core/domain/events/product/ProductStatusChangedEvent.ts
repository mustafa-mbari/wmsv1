import { DomainEvent } from '../../base/DomainEvent';
import { EntityId } from '../../valueObjects/common/EntityId';

export class ProductStatusChangedEvent extends DomainEvent {
    constructor(
        productId: EntityId,
        public readonly oldStatus: string,
        public readonly newStatus: string,
        public readonly updatedBy?: EntityId
    ) {
        super(productId, 'ProductStatusChanged');
    }
}