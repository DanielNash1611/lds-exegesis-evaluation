import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export function readProjectFileText(relativePath: string): string {
  const candidates = [
    join(process.cwd(), relativePath),
    fileURLToPath(new URL(`../../${relativePath}`, import.meta.url)),
    fileURLToPath(new URL(`../../../${relativePath}`, import.meta.url))
  ];

  const filePath = candidates.find((candidate) => existsSync(candidate));
  if (!filePath) {
    throw new Error(`Project file not found: ${relativePath}`);
  }

  return readFileSync(filePath, "utf8");
}
