import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { afterEach, describe, expect, it } from "vitest";
import { EXEGESIS_RESULT_WIDGET_URI } from "../src/mcp/server.js";
import type { SourceSearchResult } from "../src/schemas/index.js";
import { completeEvaluation } from "./evaluation-schema.test.js";

const transports: StdioClientTransport[] = [];
const clients: Client[] = [];

async function createConnectedClient() {
  const transport = new StdioClientTransport({
    command: "npm",
    args: ["run", "mcp:stdio", "--silent"],
    cwd: process.cwd(),
    stderr: "pipe"
  });
  const client = new Client(
    { name: "exegesis-integration-test", version: "0.1.0" },
    {
      capabilities: {}
    }
  );

  transports.push(transport);
  clients.push(client);
  await client.connect(transport);
  return client;
}

afterEach(async () => {
  await Promise.allSettled(clients.splice(0).map((client) => client.close()));
  await Promise.allSettled(transports.splice(0).map((transport) => transport.close()));
});

describe("MCP server integration", () => {
  it("exposes app-ready tool and resource metadata over stdio", async () => {
    const client = await createConnectedClient();

    expect(client.getInstructions()).toContain("deterministic scripture parsing");

    const tools = await client.listTools();
    const toolNames = tools.tools.map((tool) => tool.name);
    expect(toolNames).toEqual(
      expect.arrayContaining([
        "fetch_scripture_reference",
        "find_exegesis_sources",
        "evaluate_exegesis_contract",
        "render_exegesis_result"
      ])
    );

    const renderTool = tools.tools.find((tool) => tool.name === "render_exegesis_result");
    expect(renderTool?._meta).toMatchObject({
      ui: { resourceUri: EXEGESIS_RESULT_WIDGET_URI },
      "ui/resourceUri": EXEGESIS_RESULT_WIDGET_URI,
      "openai/outputTemplate": EXEGESIS_RESULT_WIDGET_URI
    });
    expect(renderTool?.annotations?.readOnlyHint).toBe(true);
    expect(renderTool?.outputSchema).toBeDefined();

    const resources = await client.listResources();
    expect(resources.resources.map((resource) => resource.uri)).toContain(EXEGESIS_RESULT_WIDGET_URI);

    const widget = await client.readResource({ uri: EXEGESIS_RESULT_WIDGET_URI });
    expect(widget.contents[0]).toMatchObject({
      uri: EXEGESIS_RESULT_WIDGET_URI,
      mimeType: "text/html;profile=mcp-app",
      _meta: {
        "openai/widgetDescription": expect.stringContaining("validated LDS exegesis evaluation")
      }
    });
    expect("text" in widget.contents[0] ? widget.contents[0].text : "").toContain("Textual Grounding");
  });

  it("calls deterministic tools through the MCP protocol", async () => {
    const client = await createConnectedClient();

    const scripture = await client.callTool({
      name: "fetch_scripture_reference",
      arguments: { reference: "Matthew 5:14-16" }
    });
    expect(scripture.structuredContent).toMatchObject({
      ok: true,
      normalizedReference: "Matthew 5:14-16"
    });

    const sources = await client.callTool({
      name: "find_exegesis_sources",
      arguments: {
        topic: "service as worship",
        passage: "Mosiah 2:17",
        sourceTypes: ["modern_prophetic", "lds_scholarship"],
        depth: "quick"
      }
    });
    const sourceContent = sources.structuredContent as SourceSearchResult;
    expect(Array.isArray(sourceContent.modernPropheticSources)).toBe(true);
    expect(Array.isArray(sourceContent.ldsScholarshipSources)).toBe(true);

    const rendered = await client.callTool({
      name: "render_exegesis_result",
      arguments: { result: completeEvaluation() }
    });
    expect(rendered.structuredContent).toMatchObject({
      ok: true,
      ui: {
        title: "service as worship",
        score: { label: "56/100" }
      }
    });
  });
});
