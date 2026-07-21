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
