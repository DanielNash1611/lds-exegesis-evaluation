#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rawId = process.argv[2]?.trim();
const match = rawId?.match(/^(?:plugin_)?asdk_app_([A-Za-z0-9]+)$/);

if (!match) {
  console.error("Usage: node scripts/link-chatgpt-app.mjs plugin_asdk_app_<id>");
  process.exit(1);
}

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(pluginRoot, ".codex-plugin/plugin.json");
const appManifestPath = resolve(pluginRoot, ".app.json");
const appId = `asdk_app_${match[1]}`;

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.apps = "./.app.json";

const appManifest = {
  apps: {
    "lds-exegesis-evaluation": {
      id: appId,
      category: "Education"
    }
  }
};

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(appManifestPath, `${JSON.stringify(appManifest, null, 2)}\n`);

console.log(`Linked LDS Exegesis Evaluation to ${appId}.`);
