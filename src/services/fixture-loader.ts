import { readProjectFileText } from "./project-file.js";

export function readFixtureJson(relativePath: string): unknown {
  return JSON.parse(readProjectFileText(relativePath));
}
