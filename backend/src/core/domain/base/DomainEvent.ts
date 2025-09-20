import { EntityId } from '../valueObjects/common/EntityId';

export abstract class DomainEvent {
    public readonly eventId: EntityId;
    public readonly aggregateId: EntityId;
    public readonly occurredOn: Date;
    public readonly eventType: string;

    constructor(aggregateId: EntityId, eventType: string) {
        this.eventId = EntityId.generate();
        this.aggregateId = aggregateId;
        this.occurredOn = new Date();
        this.eventType = eventType;
    }
}