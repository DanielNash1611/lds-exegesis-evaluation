# LDS Exegesis Evaluation Plugin

This local plugin packages the LDS exegesis evaluation workflows and connects them to the deterministic MCP server in this repository. It does not run a second LLM.

## Included

- `evaluate-lds-exegesis`: complete evaluation workflow and authority boundary.
- `fetch-scripture-context`: deterministic reference parsing and scripture retrieval.
- `audit-exegesis-citations`: source, score, schema, and language review.
- Hosted Streamable HTTP MCP registration for all four tools.
- The versioned exegesis result widget served by `render_exegesis_result`.

## Local Install

The package is designed for a personal local marketplace entry at `~/.agents/plugins/marketplace.json`, with the installed plugin at `~/plugins/lds-exegesis-evaluation`.

After the package is copied and the marketplace entry is created, restart the ChatGPT desktop app. Open the Plugins Directory, select the personal source, install `LDS Exegesis Evaluation`, and test it in a new ChatGPT Work mode or Codex conversation.

The `.mcp.json` file points to the public, read-only Streamable HTTP endpoint at `https://lds-exegesis-evaluation.vercel.app/mcp`. Local development can still use `npm run mcp:stdio` or `npm run mcp:http` from the repository root.

## Link A Developer Mode App

For web ChatGPT or a shareable MCP-backed app:

1. Run `npm run mcp:http` at the repository root.
2. Expose `/mcp` through a public HTTPS endpoint.
3. Create the app in ChatGPT Developer Mode.
4. Copy the resulting ID beginning with `plugin_asdk_app`.
5. Run `node scripts/link-chatgpt-app.mjs plugin_asdk_app_<id>` in this plugin directory.
6. Revalidate and reinstall the plugin.

The linking script creates `.app.json` with the normalized `asdk_app...` ID and adds the required `apps` pointer to `.codex-plugin/plugin.json`.
