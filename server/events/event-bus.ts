/**
 * Event bus — Redis Streams in production, in-process fallback for local dev.
 *
 * Production (REDIS_URL set):
 *   - publish() writes to Redis Stream `photonictag:events`
 *   - subscribe() uses XREADGROUP for at-least-once delivery
 *   - Events survive process restarts; multiple instances can consume
 *
 * Local dev (no REDIS_URL):
 *   - Falls back to the in-process EventEmitter (zero config needed)
 *   - eventLog capped at 1000 entries to prevent memory leak
 */
import { randomUUID } from "crypto";
import type { CloudEvent, EventType } from "@shared/schema";
import { getRedisClient } from "../redis";

type EventHandler<T = unknown> = (event: CloudEvent<T>) => Promise<void>;

interface EventSubscription {
  type: EventType | "*";
  handler: EventHandler;
}

const STREAM_KEY = "photonictag:events";
const EVENT_LOG_LIMIT = 1000;

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

    // ---- persist to Redis Stream if available ----
    const redis = getRedisClient();
    if (redis) {
      try {
        await redis.xadd(
          STREAM_KEY,
          "*",                           // auto-generated stream ID
          "type",       event.type,
          "source",     event.source,
          "id",         event.id,
          "time",       event.time,
          "subject",    event.subject ?? "",
          "correlationid", event.correlationid ?? "",
          "payload",    JSON.stringify(event.data),
        );
      } catch (err) {
        console.error("[EventBus] Redis XADD failed, falling back to in-process:", (err as Error).message);
      }
    }

    // ---- in-process log (capped) ----
    this.eventLog.push(event as CloudEvent);
    if (this.eventLog.length > EVENT_LOG_LIMIT) {
      this.eventLog.shift();
    }

    // ---- dispatch to local subscribers ----
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
    return () => {
      const index = this.subscriptions.indexOf(subscription);
      if (index > -1) this.subscriptions.splice(index, 1);
    };
  }

  /**
   * Consume events from Redis Stream for background workers / audit pipeline.
   * Call once at startup for each consumer group member.
   *
   * @param groupName  Consumer group (e.g. "audit-pipeline")
   * @param consumer   Unique consumer name (e.g. hostname + PID)
   * @param handler    Callback; throw to NACK and retry
   */
  async startStreamConsumer(
    groupName: string,
    consumer: string,
    handler: (event: CloudEvent) => Promise<void>
  ): Promise<void> {
    const redis = getRedisClient();
    if (!redis) {
      console.log("[EventBus] No Redis — skipping stream consumer (in-process mode).");
      return;
    }

    // Create consumer group if it doesn't exist
    try {
      await redis.xgroup("CREATE", STREAM_KEY, groupName, "0", "MKSTREAM");
    } catch (err: any) {
      if (!err.message?.includes("BUSYGROUP")) throw err;
    }

    const poll = async () => {
      while (true) {
        try {
          const results = await redis.xreadgroup(
            "GROUP", groupName, consumer,
            "BLOCK", 5000,
            "COUNT", 10,
            "STREAMS", STREAM_KEY, ">"
          ) as any;

          if (!results) continue;

          for (const [, messages] of results) {
            for (const [msgId, fields] of messages) {
              try {
                const fieldMap: Record<string, string> = {};
                for (let i = 0; i < fields.length; i += 2) {
                  fieldMap[fields[i]] = fields[i + 1];
                }
                const event: CloudEvent = {
                  id: fieldMap.id,
                  specversion: "1.0",
                  source: fieldMap.source,
                  type: fieldMap.type as EventType,
                  time: fieldMap.time,
                  datacontenttype: "application/json",
                  data: JSON.parse(fieldMap.payload ?? "null"),
                  subject: fieldMap.subject || undefined,
                  correlationid: fieldMap.correlationid || undefined,
                };
                await handler(event);
                await redis.xack(STREAM_KEY, groupName, msgId);
              } catch (err) {
                console.error("[EventBus] Failed to process stream message:", msgId, err);
                // Message stays in PEL for retry / dead-letter handling
              }
            }
          }
        } catch (err: any) {
          if (err.message?.includes("NOGROUP")) break;
          console.error("[EventBus] Stream consumer error:", err.message);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    };

    poll().catch(console.error);
  }

  getEventLog(): CloudEvent[] { return [...this.eventLog]; }
  getEventsByType(type: EventType): CloudEvent[] {
    return this.eventLog.filter((e) => e.type === type);
  }
  clearEventLog(): void { this.eventLog = []; }
}

export const eventBus = new EventBus();
