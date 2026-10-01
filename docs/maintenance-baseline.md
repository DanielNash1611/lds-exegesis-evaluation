# Maintenance baseline

Prepared locally on 2026-09-30 from the assigned production commit on branch
`maintenance/secure-baseline`. Original checkouts and their uncommitted work were
preserved. No push, PR, deployment, live database, private credential, AI call,
email, or user-data transmission was performed. npm registry metadata and
`npm audit` supplied dependency/advisory evidence. CI uses Node 22 and locked
`npm ci`; local checks used Node 22.22.1. Browser QA used cached Chromium with
all external browser requests blocked. Remote deployment behavior is unverified.

Baseline: `704ee2a39ca4b68e0cb53fc8ac601cb80b80e64f`.

Refreshed compatible MCP SDK/toolchain/transitive packages, added deterministic
CI and supported Node runtime bounds. This service is fixture-backed; it does
not invoke an LLM. Existing transport, parser, scripture/source fixtures and
schema tests remain intact.

Verified clean install; all 34 tests including HTTP and stdio MCP transport;
typecheck; TypeScript build; local browser service descriptor with no page
errors. Final npm audit: zero vulnerabilities. No lint script exists; compiler
checks are the static gate. Existing regression coverage already covers the
service's externally observable protocol contracts, so CI runs that suite.
