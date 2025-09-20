import { EntityId } from './common.types';

/**
 * Domain event interface
 */
export interface IDomainEvent {
    aggregateId: EntityId;
    eventType: string;
    occurredOn: Date;
    eventVersion: number;
    eventData: any;
}

/**
 * Value object base interface
 */
export interface IValueObject<T> {
    equals(other: T): boolean;
    getValue(): any;
}

/**
 * Entity base interface
 */
export interface IEntity<T = EntityId> {
    id: T;
    equals(other: IEntity<T>): boolean;
}

/**
 * Aggregate root interface
 */
export interface IAggregateRoot<T = EntityId> extends IEntity<T> {
    getUncommittedEvents(): IDomainEvent[];
    markEventsAsCommitted(): void;
    addDomainEvent(event: IDomainEvent): void;
}

/**
 * Repository interface
 */
export interface IRepository<T, ID = EntityId> {
    findById(id: ID): Promise<T | null>;
    save(entity: T): Promise<void>;
    update(entity: T): Promise<void>;
    delete(id: ID): Promise<void>;
}

/**
 * Use case interface
 */
export interface IUseCase<TRequest, TResponse> {
    execute(request: TRequest): Promise<TResponse>;
}

/**
 * Query interface
 */
export interface IQuery<TResult> {
    execute(): Promise<TResult>;
}

/**
 * Command interface
 */
export interface ICommand<TResult = void> {
    execute(): Promise<TResult>;
}