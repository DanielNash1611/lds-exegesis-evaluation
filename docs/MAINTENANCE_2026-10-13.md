# Maintenance — October 13, 2026

The transitive Vite copy used by Vitest is locked to 8.3.4, replacing affected
8.3.1. The October 6 development-server advisories
[GHSA-rq7h-c2jc-7f22](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22)
and [GHSA-vfpm-58rq-9qcg](https://github.com/vitejs/vite/security/advisories/GHSA-vfpm-58rq-9qcg)
were fixed in 8.3.3. Vite's PostCSS/Nanoid dependencies also refresh. Vitest stays
at the existing 4.1.11; there is no override or test-runner major migration.

The isolated branch starts at remote `main`
`057be2af59cce1edaf2a52fd5071607a5bb665d5`. Vercel production still reports
that commit READY with Node 24. CI now covers Node 22 and 24 and runs
`npm run test:built-mcp` after compilation.

The new smoke uses the compiled HTTP and stdio entry points with the real MCP
client. It checks initialization/instructions, all four read-only tools, a
fixture scripture range, source metadata, evaluation contract, validated fixture
render and widget resource. HTTP additionally checks the descriptor and GET
rejection. It binds only loopback, uses an ephemeral port, disables telemetry,
inherits no service credentials and closes its server/client resources.

The shared evaluation fixture was moved out of a test module so the standalone
built smoke can reuse it without importing Vitest test registration. All existing
assertions remain; the 24 unique tests run once rather than re-registering the
four schema tests in three importing suites (the previous reported count was 36).

Clean installs, typecheck, all 24 deterministic tests, build and both built
transport smokes pass on Node 22.23.3 and 24.21.0. Full npm audits report zero
findings. There is no configured lint command in this repository. No semantic
evaluation, live provider, credentials or model service was used.

Next: review the local commits before any publication or deployment.
