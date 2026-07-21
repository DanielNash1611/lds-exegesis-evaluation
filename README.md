# LDS Exegesis Evaluation Assistant

Deterministic MCP foundation for an LDS exegesis evaluation assistant that can later become a ChatGPT App.

ChatGPT remains the reasoning and synthesis layer. This server provides scripture reference parsing, fixture-backed scripture fetching, source-card candidates, validation schemas, and a small app UI resource. It does not call an LLM.

## Run Locally

```bash
npm install
npm test
npm run typecheck
npm run build
```

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

The root `server.ts` exports the same Express app for Vercel's Node.js runtime. Vercel terminates HTTPS and exposes the stateless Streamable HTTP endpoint at:

```text
https://<deployment-host>/mcp
```

The root URL returns a small service descriptor with the exact MCP URL. No API keys or external source credentials are required for the fixture-backed MVP. The endpoint is intentionally read-only and unauthenticated; add authentication before introducing private providers or user data.

## ChatGPT Developer Mode Setup

1. Start the HTTP server with `npm run mcp:http`.
2. Expose the local port through an HTTPS tunnel.
3. Use the tunneled URL plus `/mcp` when creating the app in ChatGPT Developer Mode.
4. Refresh the app after changing tool descriptions, output schemas, server instructions, or UI resource metadata.

## Tool Surface

- `fetch_scripture_reference`
- `find_exegesis_sources`
- `evaluate_exegesis_contract`
- `render_exegesis_result`

The render tool returns `structuredContent` with the validated evaluation and a card-oriented `ui` payload. It also points to the registered, versioned `ui://exegesis/result-v1.html` component.

## Local Plugin Package

The installable local plugin lives at `plugins/lds-exegesis-evaluation`. It bundles three repeatable skills, launches this repo's stdio MCP server, and exposes the validated-result widget in supported ChatGPT/Codex plugin surfaces.

The local package deliberately omits `.app.json` until ChatGPT creates a real Developer Mode app ID. This keeps the local MCP plugin usable now without shipping a fake connector. See the plugin README for local installation and later app-ID wiring.

## Source Boundaries

The scripture and exegesis source data are local fixtures for deterministic development. Modern prophetic and LDS scholarship source candidates are metadata only. Do not add scraping or long copyrighted quotations without a documented source/license policy.
