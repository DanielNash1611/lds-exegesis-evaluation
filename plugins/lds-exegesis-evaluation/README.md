# LDS Exegesis Evaluation Plugin

This local plugin packages the LDS exegesis evaluation workflows and connects them to the deterministic MCP server in this repository. It does not run a second LLM.

## Included

- `evaluate-lds-exegesis`: complete evaluation workflow and authority boundary.
- `fetch-scripture-context`: deterministic reference parsing and scripture retrieval.
- `audit-exegesis-citations`: source, score, schema, and language review.
- Local stdio MCP registration for all four tools.
- The versioned exegesis result widget served by `render_exegesis_result`.

## Local Install

The package is designed for a personal local marketplace entry at `~/.agents/plugins/marketplace.json`, with the installed plugin at `~/plugins/lds-exegesis-evaluation`.

After the package is copied and the marketplace entry is created, restart the ChatGPT desktop app. Open the Plugins Directory, select the personal source, install `LDS Exegesis Evaluation`, and test it in a new ChatGPT Work mode or Codex conversation.

The `.mcp.json` file resolves the development server two directories above the source plugin. That supports repository-local development without publishing a machine-specific absolute path. A marketplace that copies only the plugin directory should use the hosted app binding described below instead.

## Link A Developer Mode App

For web ChatGPT or a shareable MCP-backed app:

1. Run `npm run mcp:http` at the repository root.
2. Expose `/mcp` through a public HTTPS endpoint.
3. Create the app in ChatGPT Developer Mode.
4. Copy the resulting ID beginning with `plugin_asdk_app`.
5. Run `node scripts/link-chatgpt-app.mjs plugin_asdk_app_<id>` in this plugin directory.
6. Revalidate and reinstall the plugin.

The linking script creates `.app.json` with the normalized `asdk_app...` ID and adds the required `apps` pointer to `.codex-plugin/plugin.json`.
