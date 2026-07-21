import { describe, expect, it } from "vitest";
import { parseScriptureReference } from "../src/services/scriptures/reference-parser.js";

function expectParsed(input: string, normalizedReference: string) {
  const parsed = parseScriptureReference(input);
  expect("ok" in parsed).toBe(false);
  if ("ok" in parsed) {
    throw new Error(parsed.message);
  }
  expect(parsed.normalizedReference).toBe(normalizedReference);
}

describe("scripture reference parser", () => {
  it("normalizes required scripture reference examples", () => {
    expectParsed("Mosiah 2:17", "Mosiah 2:17");
    expectParsed("2 Nephi 25:23", "2 Nephi 25:23");
    expectParsed("1 Ne. 3:7", "1 Nephi 3:7");
    expectParsed("D&C 4:2", "Doctrine and Covenants 4:2");
    expectParsed("Doctrine and Covenants 121:41-46", "Doctrine and Covenants 121:41-46");
    expectParsed("Moses 1:39", "Moses 1:39");
    expectParsed("Articles of Faith 1:13", "Articles of Faith 1:13");
    expectParsed("John 3:16", "John 3:16");
    expectParsed("Matthew 5:14-16", "Matthew 5:14-16");
    expectParsed("1 Corinthians 13:1-3", "1 Corinthians 13:1-3");
    expectParsed("JS-H 1:17", "Joseph Smith—History 1:17");
  });

  it("returns an unknown book error", () => {
    const parsed = parseScriptureReference("Unknownbook 1:1");
    expect(parsed).toMatchObject({
      ok: false,
      code: "unknown_book"
    });
  });

  it("returns a malformed reference error", () => {
    const parsed = parseScriptureReference("Mosiah chapter two");
    expect(parsed).toMatchObject({
      ok: false,
      code: "malformed_reference"
    });
  });
});
