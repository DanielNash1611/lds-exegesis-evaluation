# LDS Exegesis Evaluation Assistant Foundation

This repo is an MVP foundation for moving an existing Custom GPT into a deterministic tool/schema architecture. ChatGPT remains the reasoning and synthesis layer. The MCP server supplies only parsing, source lookup, structured contracts, and validation.

## Current MVP

- TypeScript + Zod schemas define `StandardExegesisEvaluation`, source cards, scripture passage payloads, and MCP tool inputs/outputs.
- `fetch_scripture_reference` parses a single reference or same-chapter range and fetches from a tiny local fixture corpus.
- `find_exegesis_sources` returns scripture candidates when available plus metadata-only modern prophetic and LDS scholarship candidates from a curated fixture index.
- `evaluate_exegesis_contract` returns the preserved evaluation behavior, required sections, rubric, constraints, and deterministic source context.
- `render_exegesis_result` validates a structured evaluation and returns path-level errors plus a card-oriented UI payload.
- `web/exegesis-result.html` is a self-contained MCP Apps UI resource registered on the render tool.
- `src/mcp/http-server.ts` exposes a local Streamable HTTP `/mcp` endpoint for Developer Mode testing.
- `src/mcp/http-app.ts` owns the shared Express routes, while root `server.ts` exports that app for Vercel's Node.js runtime.
- `plugins/lds-exegesis-evaluation` packages the workflows, local MCP registration, and UI metadata for installation from a personal plugin marketplace.

## Non-Authoritative Evaluation Baseline

The contract preserves the current assistant behavior:

- Evaluate interpretations as hypotheses, not people.
- Do not declare doctrine, settle theological disputes, or claim an authoritative reading.
- Prefer references over long quotations.
- Keep modern source excerpts short and metadata-rich.
- Include textual grounding, context, assumptions, alternatives, modern prophetic witnesses, LDS scholarship, and a non-authoritative support assessment.

## Source And Licensing Notes

The fixture corpus is intentionally tiny. It exists so reference parsing, fetching, and tool schemas can be tested deterministically before real source providers are chosen.

The modern prophetic and LDS scholarship fixtures are source-card metadata only. They provide titles, authors or speakers, source types, links, dates when known, and relevance notes. They do not reproduce talks, articles, manuals, footnotes, or study helps.

Do not scrape copyrighted Church manuals, study helps, footnotes, or long quoted passages. Future providers should return metadata, links, short excerpts when permitted, source names, and license notes. Real scripture-provider selection should document the corpus, edition, license, update cadence, and fallback behavior.

## Deferred Provider TODOs

- Replace or augment `FixtureScriptureProvider` with a permission-safe standard works corpus provider.
- Expand `FixturePropheticSourceProvider` into a real provider using licensed or publicly accessible metadata and short quote policy.
- Expand `FixtureScholarshipProvider` into a real provider using selected LDS scholarship repositories/publications.
- Expand `CitationValidator` to verify source type compatibility, source coverage, URL reachability, and source freshness.
- Add production hosting, auth policy, submission metadata, and richer UI interactions in a later phase.

## Hosting Model

The HTTP transport is stateless: every `POST /mcp` request creates and closes its own MCP server and transport. This makes the deterministic read-only MVP compatible with Vercel Functions and avoids relying on in-memory sessions across invocations.

The public endpoint has no authentication because it exposes only local fixtures, schemas, and validation. Authentication becomes required before adding private corpora, user-specific state, write tools, or metered external providers.

## Local Commands

```bash
npm install
npm test
npm run typecheck
npm run mcp:stdio
npm run mcp:http
```

## Plugin And App Binding

The local plugin uses `.mcp.json` to launch the repo's stdio server. This is the immediate custom-install path for the ChatGPT desktop app and Codex.

The future web ChatGPT app binding is account-specific. After the HTTP server is exposed through public HTTPS and registered in ChatGPT Developer Mode, run the plugin's `scripts/link-chatgpt-app.mjs` with the real `plugin_asdk_app...` ID. That creates `.app.json` and adds the manifest's `apps` pointer. No placeholder app ID is committed.
