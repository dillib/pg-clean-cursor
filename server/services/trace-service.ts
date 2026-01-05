import { storage } from "../storage";
import { eventBus } from "../events/event-bus";
import type { TraceEvent, InsertTraceEvent, TraceEventType, TraceLocation } from "@shared/schema";

export class TraceService {
  async getTraceEvent(id: string): Promise<TraceEvent | undefined> {
    return storage.getTraceEvent(id);
  }

  async getTraceEventsByProductId(productId: string): Promise<TraceEvent[]> {
    return storage.getTraceEventsByProductId(productId);
  }

  async recordEvent(
    productId: string,
    eventType: TraceEventType,
    actor: string,
    options?: {
      location?: TraceLocation;
      description?: string;
      metadata?: Record<string, unknown>;
      parentEventId?: string;
    }
  ): Promise<TraceEvent> {
    const eventData: InsertTraceEvent = {
      productId,
      eventType,
      actor,
      location: options?.location || null,
      description: options?.description || null,
      metadata: options?.metadata || {},
      parentEventId: options?.parentEventId || null,
      timestamp: new Date(),
    };

    const traceEvent = await storage.createTraceEvent(eventData);

    await eventBus.publish({
      type: "com.photonictag.trace.recorded",
      source: "trace-service",
      data: traceEvent,
      subject: productId,
    });

    return traceEvent;
  }

  async getProductTimeline(productId: string): Promise<TraceEvent[]> {
    return storage.getTraceEventsByProductId(productId);
  }

  async recordManufactured(productId: string, manufacturer: string, location?: TraceLocation): Promise<TraceEvent> {
    return this.recordEvent(productId, "manufactured", manufacturer, {
      location,
      description: `Product manufactured by ${manufacturer}`,
    });
  }

  async recordShipped(productId: string, shipper: string, from: TraceLocation, to: TraceLocation): Promise<TraceEvent> {
    return this.recordEvent(productId, "shipped", shipper, {
      location: from,
      description: `Shipped from ${from.name} to ${to.name}`,
      metadata: { destination: to },
    });
  }

  async recordTransferred(productId: string, from: string, to: string): Promise<TraceEvent> {
    return this.recordEvent(productId, "transferred", from, {
      description: `Ownership transferred from ${from} to ${to}`,
      metadata: { previousOwner: from, newOwner: to },
    });
  }
}

export const traceService = new TraceService();
