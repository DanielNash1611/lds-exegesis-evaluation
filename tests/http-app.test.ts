import { INPUT_LIMITS, assertInputBudget } from "../src/mcp/input-limits.js";
import { completeEvaluation } from "./fixtures/evaluation.js";
import type { Server } from "node:http";
import { afterEach, describe, expect, it } from "vitest";
import { createExegesisHttpApp } from "../src/mcp/http-app.js";

let server: Server | undefined;

async function startApp() {
  const app = createExegesisHttpApp();
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve, reject) => {
    server?.once("listening", resolve);
    server?.once("error", reject);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("HTTP test server did not bind to a TCP port.");
  }

  return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
  if (!server) return;
  await new Promise<void>((resolve, reject) => {
    server?.close((error) => (error ? reject(error) : resolve()));
  });
  server = undefined;
});

describe("HTTP MCP app", () => {
  it("advertises its Streamable HTTP endpoint", async () => {
    const baseUrl = await startApp();
    const response = await fetch(baseUrl);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      name: "lds-exegesis-evaluation-assistant",
      mcp: `${baseUrl}/mcp`,
      transport: "streamable-http",
      status: "ok"
    });
  });

  it("serves MCP initialize over stateless HTTP", async () => {
    const baseUrl = await startApp();
    const response = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: { name: "http-app-test", version: "0.1.0" }
        }
      })
    });

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toContain("lds-exegesis-evaluation-assistant");
    expect(body).toContain("protocolVersion");
  });
});


describe("HTTP input budget", () => {
  it("preserves a complete evaluation and exact structural boundaries", () => {
    expect(() => assertInputBudget({ evaluation: completeEvaluation })).not.toThrow();
    expect(() => assertInputBudget(Array(INPUT_LIMITS.elements).fill(0))).not.toThrow();
    expect(() => assertInputBudget(Array(INPUT_LIMITS.elements + 1).fill(0))).toThrow();
    expect(() => assertInputBudget("x".repeat(INPUT_LIMITS.string))).not.toThrow();
    expect(() => assertInputBudget("x".repeat(INPUT_LIMITS.string + 1))).toThrow();
    let value: unknown = 0;
    for (let i = 0; i < INPUT_LIMITS.depth; i++) value = { x: value };
    expect(() => assertInputBudget(value)).not.toThrow();
    expect(() => assertInputBudget({ x: value })).toThrow();
  });
  it("rejects envelope attacks, malformed, unsupported and compressed bodies before dispatch", async () => {
    const baseUrl = await startApp();
    const cases: Array<[string, number, Record<string, string>?]> = [
      ["{", 400], ["null", 400],
      [JSON.stringify({ unknown: Array(INPUT_LIMITS.elements + 1).fill(0) }), 413],
      [JSON.stringify({ unknown: "x".repeat(INPUT_LIMITS.string + 1) }), 413],
      ["{}" + " ".repeat(INPUT_LIMITS.bytes), 413],
      ["{}", 415, { "content-type": "text/plain" }],
      ["{}", 415, { "content-encoding": "gzip" }]
    ];
    for (const [body, status, headers] of cases) {
      const response = await fetch(`${baseUrl}/mcp`, { method: "POST", headers: { "content-type": "application/json", ...headers }, body });
      expect(response.status).toBe(status);
      expect(response.headers.get("content-type")).toContain("application/json");
    }
    const init = JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } } });
    const response = await fetch(`${baseUrl}/mcp`, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: init + " ".repeat(INPUT_LIMITS.bytes - Buffer.byteLength(init)) });
    expect(response.status).toBe(200);
  });
});
