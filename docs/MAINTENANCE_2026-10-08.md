# October 8, 2026 maintenance verification

This dated entry supersedes older maintenance reproduction instructions for this pass and preserves their historical results.

## Baseline and changes

Prepared in an independent local clone on `codex/maintenance-2026-10-08` from verified current `origin/main` at `b12ea3b021dcfea3a51dd8c876cf01d24b62b922`. The latest READY production deployment reported by read-only Vercel metadata has the same branch and commit SHA.

The existing CI selection of Node 22 remains. CI uses exact `actions/checkout@v7.0.1` and `actions/setup-node@v7.1.0` releases. Both Actions previously used v4. The MCP SDK manifest and lockfile now select `~1.32.1` / 1.32.1, limiting future automatic resolution to 1.32.x. No protocol code, integration mocks, schemas, assertions, prompts, or semantic scoring changed.

## Reproduction and observed checks

Locally verified with the official SHA256-checked Node **22.23.3** Darwin arm64 distribution and its npm **10.9.9**. `npm ci`, `npm test`, `npm run typecheck`, and `npm run build` all passed. The compiled service also passed a loopback-only SDK Streamable HTTP smoke covering its descriptor, handshake, tool listing, fixture scripture/source calls, invalid-input rejection, widget resource metadata/content, and unsupported HTTP method. Coverage includes 36 Vitest tests across 8 files, including fixture-backed HTTP and SDK stdio integration.

Verification used a credential-free environment and no copied local `.env` files. The four app suites retain their existing guards against unmocked integration requests. Exegesis uses local fixtures, mock analytics sends, and loopback transport integration; an external verification preload blocked non-test network/socket destinations. No live database, mail, AI, or Ollama endpoint was used.

Final `npm audit --audit-level=low --json` exited 1: 1 finding (0 moderate, 0 high, 1 critical).

No override, workaround, downgrade, audit exception, audit suppression, or `npm audit fix` was applied. [proxy-addr GHSA-jqcg-44mw-7w3h](https://github.com/advisories/GHSA-jqcg-44mw-7w3h) affects the unchanged Express dependency subtree; a 2.0.8 patch is available. This remaining critical finding was reported during the pass and was left outside the assigned Node/Actions/MCP update scope.

Full logs and raw audits are retained in `/Users/danielnash/Documents/Codex/2026-10-08/task-2/evidence/`: `lds-exegesis-evaluation-clean-install.log`, `lds-exegesis-evaluation-audit.json`, and `lds-exegesis-evaluation-final-test.log`, `lds-exegesis-evaluation-run-typecheck.log`, `lds-exegesis-evaluation-run-build.log`, `lds-exegesis-evaluation-final-built-smoke.log`. The final Exegesis install after restoring unrelated lockfile platform metadata is `lds-exegesis-evaluation-final-clean-install.log`.

## Limits

No push, PR, merge, deployment, settings change, or permission change occurred. Vercel read-only metadata reports project Node 24.x; those settings were preserved. Hosted Linux Actions and deployed behavior remain unverified. Existing local checkouts, their dirty files, and unpublished commits were preserved. Semantic/model quality was not evaluated; existing opt-in evaluation commands and prior quality evidence remain separate. There is no lint script; TypeScript supplies the static check.

## Verified upstream sources

- [Node 22.23.3 release](https://nodejs.org/en/blog/release/v22.23.3).
- [checkout 7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) and [setup-node 7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0).
- [MCP SDK 1.32.1 release](https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/1.32.1) and official npm metadata: `https://registry.npmjs.org/@modelcontextprotocol%2fsdk/1.32.1`.
