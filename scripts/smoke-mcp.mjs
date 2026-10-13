import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { completeEvaluation } from "../dist/tests/fixtures/evaluation.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const env = {
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  CI: "true",
  DANIEL_ANALYTICS_DISABLED: "true"
};

async function checkProtocol(transport, label) {
  const client = new Client({ name: "built-maintenance-smoke", version: "1.0.0" });
  try {
    await client.connect(transport);
    assert.match(client.getInstructions(), /deterministic scripture parsing/);
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(tool => tool.name).sort(), [
      "evaluate_exegesis_contract", "fetch_scripture_reference",
      "find_exegesis_sources", "render_exegesis_result"
    ]);
    assert.ok(tools.every(tool => tool.annotations?.readOnlyHint === true));
    const call = async (name, args) => {
      const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 5000 });
      assert.notEqual(result.isError, true);
      return result.structuredContent;
    };
    const scripture = await call("fetch_scripture_reference", { reference: "Matthew 5:14-16" });
    assert.equal(scripture.ok, true);
    assert.equal(scripture.normalizedReference, "Matthew 5:14-16");
    assert.equal(scripture.passages.length, 1);
    assert.deepEqual(scripture.passages[0].verses.map(verse => verse.verse), [14, 15, 16]);
    assert.match(scripture.passages[0].verses[2].text, /glorify your Father/);
    const sources = await call("find_exegesis_sources", {
      topic: "service as worship", passage: "Mosiah 2:17",
      sourceTypes: ["scripture", "modern_prophetic", "lds_scholarship"], depth: "quick"
    });
    assert.ok(sources.scriptureSources.length > 0);
    assert.ok(Array.isArray(sources.modernPropheticSources));
    assert.ok(Array.isArray(sources.ldsScholarshipSources));
    const contract = await call("evaluate_exegesis_contract", {
      userText: "Service to others may be a form of service to God.",
      passage: "Mosiah 2:17", requestedDepth: "quick"
    });
    assert.ok(contract.requiredSections.length > 0);
    assert.equal(contract.sourceContext.fetchedScriptures[0].reference, "Mosiah 2:17");
    const rendered = await call("render_exegesis_result", { result: completeEvaluation() });
    assert.equal(rendered.ok, true);
    assert.equal(rendered.ui.score.label, "56/100");
    const { resources } = await client.listResources();
    const uri = "ui://exegesis/result-v1.html";
    assert.ok(resources.some(resource => resource.uri === uri));
    const widget = await client.readResource({ uri });
    assert.equal(widget.contents[0].mimeType, "text/html;profile=mcp-app");
    assert.match(widget.contents[0].text, /Textual Grounding/);
    console.log(`PASS built ${label} MCP fixtures, contract, render and widget resource`);
  } finally {
    await client.close();
    await transport.close();
  }
}

// Reserve an ephemeral loopback port so parallel CI jobs need no fixed port.
const reservation = createServer();
reservation.listen(0, "127.0.0.1");
await once(reservation, "listening");
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
const child = spawn(process.execPath, ["dist/src/mcp/http-server.js"], {
  cwd: root, env: { ...env, HOST: "127.0.0.1", PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
});
let output = "";
child.stdout.on("data", chunk => { output += chunk; });
child.stderr.on("data", chunk => { output += chunk; });
child.on("error", error => { output += error.message; });
try {
  const url = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    assert.equal(child.exitCode, null, `Built HTTP server exited: ${output}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      assert.equal(response.status, 200);
      const descriptor = await response.json();
      assert.equal(descriptor.status, "ok");
      assert.equal(descriptor.mcp, `${url}/mcp`);
      ready = true;
      break;
    } catch { await delay(50); }
  }
  assert.ok(ready, `Built HTTP server did not start: ${output}`);
  const rejected = await fetch(`${url}/mcp`, { signal: AbortSignal.timeout(1000) });
  assert.equal(rejected.status, 405);
  await checkProtocol(new StreamableHTTPClientTransport(new URL(`${url}/mcp`)), "HTTP");
} finally {
  if (child.exitCode === null) {
    const stopped = once(child, "exit");
    child.kill("SIGINT");
    await Promise.race([stopped, delay(3000)]);
    if (child.exitCode === null) {
      child.kill("SIGKILL");
      await stopped;
    }
  }
}
await checkProtocol(new StdioClientTransport({
  command: process.execPath, args: ["dist/src/mcp/server.js"],
  cwd: root, env, stderr: "pipe"
}), "stdio");
