import type { Corpus, ParseError, ParsedScriptureReference } from "../../schemas/scriptures.js";

const BOOK_ALIASES = new Map<string, string>([
  ["1 ne", "1 Nephi"],
  ["1 nephi", "1 Nephi"],
  ["2 ne", "2 Nephi"],
  ["2 nephi", "2 Nephi"],
  ["mosiah", "Mosiah"],
  ["d and c", "Doctrine and Covenants"],
  ["dc", "Doctrine and Covenants"],
  ["doctrine and covenants", "Doctrine and Covenants"],
  ["doctrine covenants", "Doctrine and Covenants"],
  ["js-h", "Joseph Smith—History"],
  ["jsh", "Joseph Smith—History"],
  ["joseph smith-history", "Joseph Smith—History"],
  ["joseph smith history", "Joseph Smith—History"],
  ["moses", "Moses"],
  ["articles of faith", "Articles of Faith"],
  ["article of faith", "Articles of Faith"],
  ["a of f", "Articles of Faith"],
  ["john", "John"],
  ["jn", "John"],
  ["matthew", "Matthew"],
  ["matt", "Matthew"],
  ["mt", "Matthew"],
  ["1 corinthians", "1 Corinthians"],
  ["1 cor", "1 Corinthians"],
  ["1 corinth", "1 Corinthians"],
  ["first corinthians", "1 Corinthians"],
  ["genesis", "Genesis"],
  ["gen", "Genesis"],
  ["exodus", "Exodus"],
  ["ex", "Exodus"],
  ["psalms", "Psalms"],
  ["psalm", "Psalms"],
  ["ps", "Psalms"],
  ["isaiah", "Isaiah"],
  ["isa", "Isaiah"],
  ["luke", "Luke"],
  ["lk", "Luke"],
  ["mark", "Mark"],
  ["mk", "Mark"],
  ["romans", "Romans"],
  ["rom", "Romans"],
  ["hebrews", "Hebrews"],
  ["heb", "Hebrews"],
  ["james", "James"],
  ["jas", "James"],
  ["revelation", "Revelation"],
  ["rev", "Revelation"]
]);

function aliasKey(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[—–]/g, "-")
    .replace(/&/g, " and ")
    .replace(/[.]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseError(code: string, message: string): ParseError {
  return { ok: false, code, message };
}

export function normalizeBookName(input: string): string | undefined {
  return BOOK_ALIASES.get(aliasKey(input));
}

export function parseScriptureReference(input: string, corpus?: Corpus): ParsedScriptureReference | ParseError {
  const trimmed = input.trim();

  if (!trimmed) {
    return parseError("malformed_reference", "Reference cannot be empty.");
  }

  if (/[;,]/.test(trimmed)) {
    return parseError(
      "unsupported_multi_reference",
      "Multiple references are not supported in MVP 1. Submit one reference or range at a time."
    );
  }

  const chapterRangeMatch = trimmed.match(/^(.+?)\s+(\d+)-(\d+)$/);
  if (chapterRangeMatch) {
    const [, rawBook, startChapter, endChapter] = chapterRangeMatch;
    const book = normalizeBookName(rawBook);
    if (!book) {
      return parseError("unknown_book", `Unknown scripture book: ${rawBook.trim()}.`);
    }

    const chapter = Number(startChapter);
    const parsedEndChapter = Number(endChapter);
    if (parsedEndChapter < chapter) {
      return parseError("malformed_reference", "Chapter range end must be greater than or equal to the start.");
    }

    return {
      input,
      book,
      chapter,
      endChapter: parsedEndChapter,
      normalizedReference: `${book} ${chapter}-${parsedEndChapter}`,
      corpus
    };
  }

  const match = trimmed.match(/^(.+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/);
  if (!match) {
    return parseError(
      "malformed_reference",
      "Reference must look like 'Book 1:2', 'Book 1:2-4', or 'Book 1-2'."
    );
  }

  const [, rawBook, rawChapter, rawVerse, rawEndVerse] = match;
  const book = normalizeBookName(rawBook);
  if (!book) {
    return parseError("unknown_book", `Unknown scripture book: ${rawBook.trim()}.`);
  }

  const chapter = Number(rawChapter);
  const verse = rawVerse ? Number(rawVerse) : undefined;
  const endVerse = rawEndVerse ? Number(rawEndVerse) : undefined;

  if (endVerse !== undefined && verse !== undefined && endVerse < verse) {
    return parseError("malformed_reference", "Verse range end must be greater than or equal to the start verse.");
  }

  const normalizedReference =
    verse === undefined
      ? `${book} ${chapter}`
      : endVerse === undefined
        ? `${book} ${chapter}:${verse}`
        : `${book} ${chapter}:${verse}-${endVerse}`;

  return {
    input,
    book,
    chapter,
    verse,
    endVerse,
    normalizedReference,
    corpus
  };
}
