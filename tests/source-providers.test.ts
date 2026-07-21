import { describe, expect, it } from "vitest";
import { findExegesisSources, renderExegesisResult } from "../src/mcp/tools.js";
import { SchemaCitationValidator } from "../src/services/citations/index.js";
import { completeEvaluation } from "./evaluation-schema.test.js";

describe("fixture-backed exegesis source providers", () => {
  it("returns modern prophetic and LDS scholarship candidates for Mosiah 2:17 service queries", async () => {
    const result = await findExegesisSources({
      topic: "service as worship",
      passage: "Mosiah 2:17",
      sourceTypes: ["modern_prophetic", "lds_scholarship"],
      depth: "standard"
    });

    expect(result.modernPropheticSources.length).toBeGreaterThan(0);
    expect(result.ldsScholarshipSources.length).toBeGreaterThan(0);
    expect(result.modernPropheticSources[0]).toMatchObject({
      sourceType: "modern_prophetic",
      citationUrl: expect.stringContaining("churchofjesuschrist.org")
    });
    expect(result.ldsScholarshipSources.map((source) => source.title)).toContain(
      "King Benjamin: In the Service of Your God"
    );
    expect(result.notes.join(" ")).toContain("metadata-only source candidates");
  });

  it("returns leadership candidates for Doctrine and Covenants 121", async () => {
    const result = await findExegesisSources({
      topic: "righteous leadership",
      passage: "Doctrine and Covenants 121:41-46",
      sourceTypes: ["modern_prophetic", "lds_scholarship"],
      depth: "standard"
    });

    expect(result.modernPropheticSources.map((source) => source.title)).toContain("Only upon the Principles of Righteousness");
    expect(result.ldsScholarshipSources.map((source) => source.title)).toContain("Section 121");
  });

  it("validates missing citation URLs on non-scripture source cards", () => {
    const validator = new SchemaCitationValidator();

    const result = validator.validateSourceCard({
      title: "Unlinked source",
      sourceType: "modern_prophetic",
      sourceName: "General Conference"
    });

    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatchObject({
      path: "$.citationUrl",
      message: expect.stringContaining("Non-scripture source cards")
    });
  });

  it("render_exegesis_result rejects embedded modern source cards without citation URLs", () => {
    const evaluation = completeEvaluation();
    evaluation.modernPropheticWitnesses.quoteCards.push({
      speaker: "Example Speaker",
      sourceTitle: "Example Talk",
      sourceType: "general_conference",
      relevance: "Used to verify semantic citation validation."
    });

    const result = renderExegesisResult({ result: evaluation });

    expect(result.ok).toBe(false);
    expect(result.validationErrors?.[0]).toMatchObject({
      path: "modernPropheticWitnesses.quoteCards.0.citationUrl",
      message: expect.stringContaining("citationUrl")
    });
  });
});
