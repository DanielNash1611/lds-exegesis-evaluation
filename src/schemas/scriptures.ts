import { z } from "zod";
import { ToolErrorSchema } from "./common.js";

export const CorpusSchema = z.enum([
  "lds_standard_works",
  "kjv",
  "book_of_mormon",
  "doctrine_and_covenants",
  "pearl_of_great_price"
]);
export type Corpus = z.infer<typeof CorpusSchema>;

export const ScriptureVerseSchema = z.object({
  verse: z.number().int().positive(),
  text: z.string()
});
export type ScriptureVerse = z.infer<typeof ScriptureVerseSchema>;

export const ScripturePassageSchema = z.object({
  reference: z.string(),
  book: z.string(),
  chapter: z.number().int().positive(),
  verses: z.array(ScriptureVerseSchema),
  sourceName: z.string(),
  sourceUrl: z.string().url().optional(),
  licenseNote: z.string().optional()
});
export type ScripturePassage = z.infer<typeof ScripturePassageSchema>;

export const ParsedScriptureReferenceSchema = z.object({
  input: z.string(),
  book: z.string(),
  chapter: z.number().int().positive(),
  verse: z.number().int().positive().optional(),
  endChapter: z.number().int().positive().optional(),
  endVerse: z.number().int().positive().optional(),
  normalizedReference: z.string(),
  corpus: CorpusSchema.optional()
});
export type ParsedScriptureReference = z.infer<typeof ParsedScriptureReferenceSchema>;

export const ParseErrorSchema = z.object({
  ok: z.literal(false),
  code: z.string(),
  message: z.string()
});
export type ParseError = z.infer<typeof ParseErrorSchema>;

export const ScriptureFetchResultSchema = z.object({
  ok: z.boolean(),
  normalizedReference: z.string().optional(),
  passages: z.array(ScripturePassageSchema).optional(),
  errors: z.array(ToolErrorSchema).optional()
});
export type ScriptureFetchResult = z.infer<typeof ScriptureFetchResultSchema>;

export const ScriptureSearchOptionsSchema = z.object({
  corpus: CorpusSchema.optional(),
  limit: z.number().int().positive().max(20).optional()
});
export type ScriptureSearchOptions = z.infer<typeof ScriptureSearchOptionsSchema>;

export const ScriptureSearchResultSchema = z.object({
  sources: z.array(ScripturePassageSchema),
  notes: z.array(z.string())
});
export type ScriptureSearchResult = z.infer<typeof ScriptureSearchResultSchema>;
