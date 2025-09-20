import { EntityId } from '../valueObjects/common/EntityId';

export interface IDomainEvent {
    eventId: EntityId;
    aggregateId: EntityId;
    occurredOn: Date;
    eventType: string;
}