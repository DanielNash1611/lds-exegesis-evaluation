import type {
  ParseError,
  ParsedScriptureReference,
  ScriptureFetchResult,
  ScriptureSearchOptions,
  ScriptureSearchResult
} from "../../schemas/scriptures.js";

export type ScriptureParseResult = ParsedScriptureReference | ParseError;

export interface ScriptureProvider {
  parseReference(input: string): ScriptureParseResult;
  fetchReference(reference: ParsedScriptureReference): Promise<ScriptureFetchResult>;
  search?(query: string, options?: ScriptureSearchOptions): Promise<ScriptureSearchResult>;
}
