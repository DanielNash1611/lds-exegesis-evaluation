import type {
  ParsedScriptureReference,
  ScriptureFetchResult,
  ScripturePassage,
  ScriptureSearchOptions,
  ScriptureSearchResult
} from "../../schemas/scriptures.js";
import { readFixtureJson } from "../fixture-loader.js";
import { parseScriptureReference } from "./reference-parser.js";
import type { ScriptureProvider } from "./provider.js";

type FixtureVerse = {
  verse: number;
  text: string;
};

type FixtureChapter = {
  book: string;
  chapter: number;
  sourceName: string;
  sourceUrl?: string;
  licenseNote?: string;
  verses: FixtureVerse[];
};

type FixtureCorpus = {
  chapters: FixtureChapter[];
};

function loadFixtureCorpus(): FixtureCorpus {
  return readFixtureJson("fixtures/scriptures.json") as FixtureCorpus;
}

export class FixtureScriptureProvider implements ScriptureProvider {
  private readonly corpus: FixtureCorpus;

  constructor(corpus = loadFixtureCorpus()) {
    this.corpus = corpus;
  }

  parseReference(input: string) {
    return parseScriptureReference(input);
  }

  async fetchReference(reference: ParsedScriptureReference): Promise<ScriptureFetchResult> {
    if (reference.endChapter && reference.endChapter !== reference.chapter) {
      return {
        ok: false,
        normalizedReference: reference.normalizedReference,
        errors: [
          {
            code: "unsupported_chapter_range_fetch",
            message: "Chapter range parsing is recognized, but fixture-backed chapter range fetching is deferred."
          }
        ]
      };
    }

    const chapter = this.corpus.chapters.find(
      (candidate) => candidate.book === reference.book && candidate.chapter === reference.chapter
    );

    if (!chapter) {
      return {
        ok: false,
        normalizedReference: reference.normalizedReference,
        errors: [
          {
            code: "reference_not_in_fixture_corpus",
            message: `${reference.normalizedReference} is parsed, but it is not present in the MVP fixture corpus.`
          }
        ]
      };
    }

    const startVerse = reference.verse ?? Math.min(...chapter.verses.map((verse) => verse.verse));
    const endVerse = reference.endVerse ?? reference.verse ?? Math.max(...chapter.verses.map((verse) => verse.verse));
    const verses = chapter.verses.filter((verse) => verse.verse >= startVerse && verse.verse <= endVerse);

    if (verses.length === 0) {
      return {
        ok: false,
        normalizedReference: reference.normalizedReference,
        errors: [
          {
            code: "verse_not_in_fixture_corpus",
            message: `${reference.normalizedReference} is parsed, but the requested verse text is not present in the MVP fixture corpus.`
          }
        ]
      };
    }

    const passage: ScripturePassage = {
      reference: reference.normalizedReference,
      book: chapter.book,
      chapter: chapter.chapter,
      verses,
      sourceName: chapter.sourceName,
      sourceUrl: chapter.sourceUrl,
      licenseNote: chapter.licenseNote
    };

    return {
      ok: true,
      normalizedReference: reference.normalizedReference,
      passages: [passage]
    };
  }

  async search(query: string, options: ScriptureSearchOptions = {}): Promise<ScriptureSearchResult> {
    const limit = options.limit ?? 5;
    const lowerQuery = query.toLowerCase();
    const sources = this.corpus.chapters
      .map((chapter) => ({
        ...chapter,
        verses: chapter.verses.filter((verse) => verse.text.toLowerCase().includes(lowerQuery))
      }))
      .filter((chapter) => chapter.verses.length > 0)
      .slice(0, limit)
      .map((chapter) => ({
        reference: `${chapter.book} ${chapter.chapter}`,
        book: chapter.book,
        chapter: chapter.chapter,
        verses: chapter.verses,
        sourceName: chapter.sourceName,
        sourceUrl: chapter.sourceUrl,
        licenseNote: chapter.licenseNote
      }));

    return {
      sources,
      notes: ["Fixture search is deterministic and limited to the local development corpus."]
    };
  }
}
