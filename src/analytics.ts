import { randomUUID } from "node:crypto";
// Per HTTP request only. Never read MCP arguments, user content, cookies or account IDs.
export function createUsageRecorder(optedOut: boolean) {
  const sessionId = "session_" + randomUUID();
  const visitorId = "visitor_" + randomUUID();
  const startedAt = Date.now();
  let lastTimestamp = startedAt - 1;
  return async (name: "scripture_fetched" | "sources_found" | "evaluation_requested" | "evaluation_completed" | "result_rendered") => {
    if (optedOut || process.env.DANIEL_ANALYTICS_DISABLED === "true" || !["production", "preview"].includes(process.env.VERCEL_ENV ?? "")) return;
    const origin = process.env.VERCEL_ENV === "production"
      ? "https://lds-exegesis-evaluation.vercel.app" : "https://" + process.env.VERCEL_URL;
    lastTimestamp = Math.max(Date.now(), lastTimestamp + 1);
    const payload = [{
      eventName: name,
      app: "lds-exegesis-evaluation",
      clientEventId: randomUUID(), sessionId, visitorId, pagePath: "/",
      occurredAt: new Date(lastTimestamp).toISOString(),
      properties: {},
    }];
    try {
      await fetch("https://www.danielnash.co/api/analytics/events", {
        method: "POST", headers: {Origin: origin, "Content-Type": "text/plain;charset=UTF-8"},
        body: JSON.stringify(payload), signal: AbortSignal.timeout(1500),
      });
    } catch { /* Analytics failure never changes a tool result or exposes payloads. */ }
  };
}
