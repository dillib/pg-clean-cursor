import { randomUUID } from "crypto";
import type { CloudEvent, EventType } from "@shared/schema";

type EventHandler<T = unknown> = (event: CloudEvent<T>) => Promise<void>;

interface EventSubscription {
  type: EventType | "*";
  handler: EventHandler;
}

class EventBus {
  private subscriptions: EventSubscription[] = [];
  private eventLog: CloudEvent[] = [];

  async publish<T>(options: {
    type: EventType;
    source: string;
    data: T;
    subject?: string;
    correlationId?: string;
  }): Promise<CloudEvent<T>> {
    const event: CloudEvent<T> = {
      id: randomUUID(),
      specversion: "1.0",
      source: options.source,
      type: options.type,
      time: new Date().toISOString(),
      datacontenttype: "application/json",
      data: options.data,
      subject: options.subject,
      correlationid: options.correlationId,
    } as CloudEvent<T>;

    this.eventLog.push(event as CloudEvent);

    console.log(`[EventBus] Published: ${event.type} from ${event.source}`, {
      id: event.id,
      subject: event.subject,
    });

    const handlers = this.subscriptions.filter(
      (sub) => sub.type === event.type || sub.type === "*"
    );

    await Promise.all(
      handlers.map(async (sub) => {
        try {
          await sub.handler(event as CloudEvent);
        } catch (error) {
          console.error(`[EventBus] Handler error for ${event.type}:`, error);
        }
      })
    );

    return event;
  }

  subscribe<T>(type: EventType | "*", handler: EventHandler<T>): () => void {
    const subscription: EventSubscription = {
      type,
      handler: handler as EventHandler,
    };

    this.subscriptions.push(subscription);

    console.log(`[EventBus] Subscribed to: ${type}`);

    return () => {
      const index = this.subscriptions.indexOf(subscription);
      if (index > -1) {
        this.subscriptions.splice(index, 1);
      }
    };
  }

  getEventLog(): CloudEvent[] {
    return [...this.eventLog];
  }

  getEventsByType(type: EventType): CloudEvent[] {
    return this.eventLog.filter((e) => e.type === type);
  }

  clearEventLog(): void {
    this.eventLog = [];
  }
}

export const eventBus = new EventBus();
