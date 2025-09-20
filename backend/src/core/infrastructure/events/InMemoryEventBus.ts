import { injectable } from 'inversify';
import { IEventBus } from '../../domain/events/IEventBus';
import { DomainEvent } from '../../domain/events/base/DomainEvent';

@injectable()
export class InMemoryEventBus implements IEventBus {
    private readonly handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map();

    public subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }

        this.handlers.get(eventType)!.push(handler);
    }

    public async publish(event: DomainEvent): Promise<void> {
        const handlers = this.handlers.get(event.eventType) || [];

        // Execute all handlers in parallel
        const promises = handlers.map(handler =>
            this.safeExecuteHandler(handler, event)
        );

        await Promise.all(promises);
    }

    public async publishMany(events: DomainEvent[]): Promise<void> {
        const promises = events.map(event => this.publish(event));
        await Promise.all(promises);
    }

    private async safeExecuteHandler(
        handler: (event: DomainEvent) => Promise<void>,
        event: DomainEvent
    ): Promise<void> {
        try {
            await handler(event);
        } catch (error) {
            // Log error but don't throw to prevent one handler failure from affecting others
            console.error(`Error handling event ${event.eventType}:`, error);
        }
    }

    public unsubscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    public clear(): void {
        this.handlers.clear();
    }

    public getHandlerCount(eventType: string): number {
        return this.handlers.get(eventType)?.length || 0;
    }
}