// Prometheus metrics for PhotonicTag.
//
// - `httpRequestDuration` histogram (seconds) labelled by method/route/status
// - `httpRequestsTotal` counter labelled by method/route/status
// - default Node.js process metrics (event loop, GC, memory, etc.)
//
// The `/metrics` endpoint and request middleware are wired in `server/index.ts`.

import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from "prom-client";

export const register = new Registry();

// Tag every metric with the app name so multi-service scrapes stay tidy.
register.setDefaultLabels({ app: "photonictag" });

collectDefaultMetrics({ register });

export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status"],
  // Reasonable bucket set for a typical web app (1ms .. 10s).
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
  registers: [register],
});
