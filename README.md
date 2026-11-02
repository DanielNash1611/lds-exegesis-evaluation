# LDS Exegesis Evaluation Assistant

Deterministic MCP foundation for an LDS exegesis evaluation assistant that can later become a ChatGPT App.

ChatGPT remains the reasoning and synthesis layer. This server provides scripture reference parsing, fixture-backed scripture fetching, source-card candidates, validation schemas, and a small app UI resource. It does not call an LLM.

## Run Locally

```bash
npm install
npm test
npm run typecheck
npm run build
npm run test:built-mcp
```

CI runs these checks on Node 22 and 24. The built MCP smoke starts the compiled
HTTP and stdio servers, exercises local scripture/evaluation fixtures and the
widget resource, and disables telemetry. It needs no credentials or model service.

## MCP Transports

Stdio, useful for local MCP clients and tests:

```bash
npm run mcp:stdio
```

Streamable HTTP, useful for ChatGPT Developer Mode with an HTTPS tunnel:

```bash
npm run mcp:http
```

The local MCP endpoint is `http://127.0.0.1:3000/mcp` by default. Set `PORT=3017` or another port if needed.

## Hosted MCP Endpoint

The `api/index.ts` Vercel Function exports the same Express app used locally. A catch-all rewrite preserves `/mcp`, while Vercel terminates HTTPS and exposes the stateless Streamable HTTP endpoint at:

```text
https://<deployment-host>/mcp
```

Production service: [lds-exegesis-evaluation.vercel.app](https://lds-exegesis-evaluation.vercel.app/)

MCP endpoint: `https://lds-exegesis-evaluation.vercel.app/mcp`

The root URL returns a small service descriptor with the exact MCP URL. No API keys or external source credentials are required for the fixture-backed MVP. The endpoint is intentionally read-only and unauthenticated; add authentication before introducing private providers or user data.

## ChatGPT Developer Mode Setup

1. Enable Developer Mode in ChatGPT.
2. Create an app using `https://lds-exegesis-evaluation.vercel.app/mcp`.
3. Copy the resulting `plugin_asdk_app...` ID if you want to add `.app.json` wiring to the bundled plugin.
4. Refresh the app after changing tool descriptions, output schemas, server instructions, or UI resource metadata.

For local transport development, run `npm run mcp:http` and expose the local port through an HTTPS tunnel instead.

## Tool Surface

- `fetch_scripture_reference`
- `find_exegesis_sources`
- `evaluate_exegesis_contract`
- `render_exegesis_result`

The render tool returns `structuredContent` with the validated evaluation and a card-oriented `ui` payload. It also points to the registered, versioned `ui://exegesis/result-v1.html` component.

## Local Plugin Package

The installable local plugin lives at `plugins/lds-exegesis-evaluation`. It bundles three repeatable skills, connects to the hosted MCP endpoint, and exposes the validated-result widget in supported ChatGPT/Codex plugin surfaces.

The local package deliberately omits `.app.json` until ChatGPT creates a real Developer Mode app ID. The `.mcp.json` connection remains usable without shipping a fake app binding. See the plugin README for local installation and later app-ID wiring.

## Source Boundaries

The scripture and exegesis source data are local fixtures for deterministic development. Modern prophetic and LDS scholarship source candidates are metadata only. Do not add scraping or long copyrighted quotations without a documented source/license policy.

## Request limits

64 KiB bodies, 1024 keys/array elements, 8192 characters per string/key, depth 16. A complete evaluation fixture is under 5 KiB and 120 elements.

Limits apply to the entire decoded JSON request before SDK/schema validation or tool work, including unknown fields. Actual streamed bytes are counted, even without Content-Length. Compressed requests are rejected (415); malformed JSON returns 400; exceeded budgets return 413. Where present, MCP servers also enable the SDK tool-element cap. Limits apply to the supported HTTP server and legacy HTTP entrypoints. Outbound responses are not truncated by these input controls.
