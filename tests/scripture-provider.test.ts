import { describe, expect, it } from "vitest";
import { fetchScriptureReference } from "../src/mcp/tools.js";

describe("fixture scripture provider", () => {
  it("fetches a single verse", async () => {
    const result = await fetchScriptureReference({ reference: "John 3:16" });

    expect(result.ok).toBe(true);
    expect(result.normalizedReference).toBe("John 3:16");
    expect(result.passages?.[0]?.verses).toHaveLength(1);
    expect(result.passages?.[0]?.verses[0]).toMatchObject({
      verse: 16,
      text: expect.stringContaining("For God so loved the world")
    });
    expect(result.passages?.[0]?.licenseNote).toContain("public domain");
  });

  it("fetches a same-chapter verse range", async () => {
    const result = await fetchScriptureReference({ reference: "Matthew 5:14-16" });

    expect(result.ok).toBe(true);
    expect(result.normalizedReference).toBe("Matthew 5:14-16");
    expect(result.passages?.[0]?.verses.map((verse) => verse.verse)).toEqual([14, 15, 16]);
  });

  it("returns a clear missing fixture error for parsed but unavailable references", async () => {
    const result = await fetchScriptureReference({ reference: "2 Nephi 25:23" });

    expect(result.ok).toBe(false);
    expect(result.normalizedReference).toBe("2 Nephi 25:23");
    expect(result.errors?.[0]?.code).toBe("reference_not_in_fixture_corpus");
  });
});
