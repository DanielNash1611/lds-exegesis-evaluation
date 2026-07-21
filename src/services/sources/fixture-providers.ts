import { z } from "zod";
import { PropheticSourceCardSchema, ScholarlySourceCardSchema } from "../../schemas/sources.js";
import { readFixtureJson } from "../fixture-loader.js";
import { parseScriptureReference } from "../scriptures/reference-parser.js";
import type { PropheticSourceProvider, ScholarshipProvider, SourceSearchQuery } from "./providers.js";

const FixturePropheticEntrySchema = z.object({
  tags: z.array(z.string()),
  passages: z.array(z.string()),
  card: PropheticSourceCardSchema
});

const FixtureScholarshipEntrySchema = z.object({
  tags: z.array(z.string()),
  passages: z.array(z.string()),
  card: ScholarlySourceCardSchema
});

const FixtureSourceIndexSchema = z.object({
  modernProphetic: z.array(FixturePropheticEntrySchema),
  ldsScholarship: z.array(FixtureScholarshipEntrySchema)
});

type FixturePropheticEntry = z.infer<typeof FixturePropheticEntrySchema>;
type FixtureScholarshipEntry = z.infer<typeof FixtureScholarshipEntrySchema>;

function loadSourceIndex() {
  return FixtureSourceIndexSchema.parse(readFixtureJson("fixtures/exegesis-sources.json"));
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[&—–]/g, " ")
    .replace(/[^a-z0-9: ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePassage(value?: string): string | undefined {
  if (!value) return undefined;
  const parsed = parseScriptureReference(value);
  return "ok" in parsed ? value : parsed.normalizedReference;
}

function queryTerms(query: SourceSearchQuery): string[] {
  const normalizedPassage = normalizePassage(query.passage);
  const rawTerms = [query.topic, query.passage, normalizedPassage]
    .filter((term): term is string => Boolean(term))
    .flatMap((term) => normalizeText(term).split(" "));

  return [...new Set(rawTerms.filter((term) => term.length >= 3))];
}

function depthLimit(depth: SourceSearchQuery["depth"]): number {
  if (depth === "deep") return 8;
  if (depth === "standard") return 4;
  return 2;
}

function scoreEntry(entry: { tags: string[]; passages: string[]; card: Record<string, unknown> }, query: SourceSearchQuery) {
  const terms = queryTerms(query);
  const normalizedPassage = normalizePassage(query.passage);
  const searchable = normalizeText(
    [
      ...entry.tags,
      ...entry.passages,
      ...Object.values(entry.card).filter((value): value is string => typeof value === "string")
    ].join(" ")
  );

  let score = 0;
  if (normalizedPassage && entry.passages.some((passage) => passage === normalizedPassage)) {
    score += 8;
  }

  for (const term of terms) {
    if (entry.tags.some((tag) => normalizeText(tag) === term)) score += 3;
    if (searchable.includes(term)) score += 1;
  }

  return score;
}

function rankedEntries<TEntry extends { tags: string[]; passages: string[]; card: { title: string } }>(
  entries: TEntry[],
  query: SourceSearchQuery
): TEntry[] {
  if (!query.topic && !query.passage) return [];

  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.card.title.localeCompare(b.entry.card.title))
    .slice(0, depthLimit(query.depth))
    .map(({ entry }) => entry);
}

export class FixturePropheticSourceProvider implements PropheticSourceProvider {
  private readonly entries: FixturePropheticEntry[];

  constructor(entries = loadSourceIndex().modernProphetic) {
    this.entries = entries;
  }

  async search(query: SourceSearchQuery) {
    return rankedEntries(this.entries, query).map((entry) => entry.card);
  }
}

export class FixtureScholarshipProvider implements ScholarshipProvider {
  private readonly entries: FixtureScholarshipEntry[];

  constructor(entries = loadSourceIndex().ldsScholarship) {
    this.entries = entries;
  }

  async search(query: SourceSearchQuery) {
    return rankedEntries(this.entries, query).map((entry) => entry.card);
  }
}
