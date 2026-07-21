import { describe, expect, it } from "vitest";
import { StandardExegesisEvaluationSchema, type StandardExegesisEvaluation } from "../src/schemas/index.js";

export function completeEvaluation(): StandardExegesisEvaluation {
  const scriptureCard = {
    title: "Mosiah 2:17",
    sourceType: "scripture" as const,
    reference: "Mosiah 2:17",
    normalizedReference: "Mosiah 2:17",
    textExcerpt: "service of your fellow beings",
    sourceName: "Development fixture",
    relevance: "Supports a connection between service to others and service to God."
  };

  return {
    topic: "service as worship",
    passage: "Mosiah 2:17",
    interpretationSummary: {
      text:
        "One plausible reading is that Mosiah 2:17 connects service to others with service to God. The interpretation is moderately supported by the verse itself. It should still be read in King Benjamin's broader sermon context. A careful evaluation should avoid turning the verse into a universal formula without considering surrounding material.",
      confidence: "medium"
    },
    textualGrounding: {
      supportingReferences: [scriptureCard],
      explanation: "The cited passage directly links service to fellow beings with service to God.",
      limitations: ["The verse alone does not define every form of worship."]
    },
    immediateContext: {
      summary: "King Benjamin is addressing his people in a covenant-sermon setting.",
      speaker: "King Benjamin",
      audience: "The people gathered at the temple",
      purpose: "To invite humility, covenant renewal, and service.",
      surroundingReferences: ["Mosiah 2"]
    },
    canonicalContext: {
      strengtheningReferences: [scriptureCard],
      complicatingOrLimitingReferences: [
        {
          title: "Matthew 5:16",
          sourceType: "scripture",
          reference: "Matthew 5:16",
          normalizedReference: "Matthew 5:16",
          textExcerpt: "glorify your Father",
          relevance: "Good works can point beyond the actor to God."
        }
      ],
      explanation: "Related passages strengthen the connection while cautioning against reducing worship to only service."
    },
    genreAndIntent: {
      genre: "sermon",
      explanation: "The passage appears in a royal covenant sermon, so rhetorical purpose matters."
    },
    assumptionsAudit: [
      {
        assumption: "Service to others is being treated as a form of worship rather than only an ethical duty.",
        impact: "This affects how broadly the interpretation applies.",
        confidence: "medium"
      }
    ],
    alternativePlausibleReadings: [
      {
        reading: "The verse may primarily rebuke pride by reminding listeners that service is accountable to God.",
        supportingReferences: [scriptureCard],
        explanation: "This reading emphasizes humility and covenant obligation more than a definition of worship."
      }
    ],
    modernPropheticWitnesses: {
      summary: "Modern prophetic source coverage is not populated in the MVP fixture.",
      quoteCards: [],
      missingAngles: ["General Conference and official source metadata provider is deferred."],
      cautions: ["Do not invent prophetic witnesses without a verified source card."],
      coverageScore: 0
    },
    ldsScholarship: {
      summary: "LDS scholarship source coverage is not populated in the MVP fixture.",
      scholarlySources: [],
      scholarlyConsensus: "Not evaluated in MVP 1.",
      contestedQuestions: ["How broadly scholars read King Benjamin's service language is deferred."],
      missingSources: ["BYU Studies, Religious Educator, Interpreter, and other provider integrations are deferred."],
      cautions: ["Do not infer scholarly consensus without retrieved source metadata."],
      coverageScore: 0
    },
    supportAssessment: {
      classification: "Moderately supported",
      explanation: "The verse supports the interpretation, but broader claims require more context."
    },
    doctrinalCautions: ["Do not present this as an authoritative definition of worship."],
    missingEvidence: ["Modern prophetic and scholarship source retrieval is not implemented in MVP 1."],
    revisionSuggestions: ["Frame the claim as a plausible reading rather than a definitive doctrinal statement."],
    readingPath: {
      scriptures: [scriptureCard],
      modernProphetic: [],
      scholarship: []
    },
    scores: {
      scripturalGrounding: 20,
      doctrinalSoundness: 16,
      propheticSupport: 0,
      scholarlySupport: 0,
      interpretiveNuance: 8,
      pastoralUsefulness: 8,
      citationQuality: 4,
      total: 56
    },
    closingReminder:
      "For full context, read the cited passages directly in the scriptures and consider multiple perspectives."
  };
}

describe("StandardExegesisEvaluation schema", () => {
  it("passes for a complete standard evaluation", () => {
    const parsed = StandardExegesisEvaluationSchema.safeParse(completeEvaluation());
    expect(parsed.success).toBe(true);
  });

  it("fails when modern prophetic witnesses are missing", () => {
    const incomplete = completeEvaluation() as Record<string, unknown>;
    delete incomplete.modernPropheticWitnesses;

    const parsed = StandardExegesisEvaluationSchema.safeParse(incomplete);
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.map((issue) => issue.path.join("."))).toContain("modernPropheticWitnesses");
  });

  it("fails when LDS scholarship is missing", () => {
    const incomplete = completeEvaluation() as Record<string, unknown>;
    delete incomplete.ldsScholarship;

    const parsed = StandardExegesisEvaluationSchema.safeParse(incomplete);
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.map((issue) => issue.path.join("."))).toContain("ldsScholarship");
  });

  it("fails when score total does not equal component scores", () => {
    const evaluation = completeEvaluation();
    evaluation.scores.total = 55;

    const parsed = StandardExegesisEvaluationSchema.safeParse(evaluation);
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path.join(".")).toBe("scores.total");
  });
});
