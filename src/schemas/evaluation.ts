import { z } from "zod";
import { ConfidenceSchema } from "./common.js";
import { SourceCardSchema, ScriptureReferenceCardSchema } from "./sources.js";

export const EvaluationRubricSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string(),
      maxScore: z.number().int().positive(),
      description: z.string()
    })
  ),
  supportClassifications: z.array(z.enum([
    "Well-supported",
    "Moderately supported",
    "Textually weak",
    "Speculative"
  ]))
});
export type EvaluationRubric = z.infer<typeof EvaluationRubricSchema>;

const CoverageScoreSchema = z.number().int().min(0).max(5);

export const StandardExegesisEvaluationSchema = z.object({
  topic: z.string().optional(),
  passage: z.string().optional(),
  interpretationSummary: z.object({
    text: z.string().min(1),
    confidence: ConfidenceSchema
  }),
  textualGrounding: z.object({
    supportingReferences: z.array(ScriptureReferenceCardSchema),
    explanation: z.string().min(1),
    limitations: z.array(z.string())
  }),
  immediateContext: z.object({
    summary: z.string().min(1),
    speaker: z.string().optional(),
    audience: z.string().optional(),
    purpose: z.string().optional(),
    surroundingReferences: z.array(z.string())
  }),
  canonicalContext: z.object({
    strengtheningReferences: z.array(ScriptureReferenceCardSchema),
    complicatingOrLimitingReferences: z.array(ScriptureReferenceCardSchema),
    explanation: z.string().min(1)
  }),
  genreAndIntent: z.object({
    genre: z.enum([
      "narrative",
      "sermon",
      "commandment",
      "vision",
      "poetry",
      "epistle",
      "prophecy",
      "other"
    ]).optional(),
    explanation: z.string().min(1)
  }),
  assumptionsAudit: z.array(
    z.object({
      assumption: z.string().min(1),
      impact: z.string().min(1),
      confidence: ConfidenceSchema
    })
  ),
  alternativePlausibleReadings: z.array(
    z.object({
      reading: z.string().min(1),
      supportingReferences: z.array(ScriptureReferenceCardSchema),
      explanation: z.string().min(1)
    })
  ),
  modernPropheticWitnesses: z.object({
    summary: z.string().min(1),
    quoteCards: z.array(
      z.object({
        speaker: z.string().min(1),
        roleAtTime: z.string().optional(),
        sourceTitle: z.string().min(1),
        sourceType: z.enum([
          "general_conference",
          "manual",
          "church_magazine",
          "official_statement",
          "other"
        ]),
        date: z.string().optional(),
        shortQuote: z.string().max(280, "Modern-source quotes must stay short.").optional(),
        relevance: z.string().min(1),
        citationUrl: z.string().url().optional()
      })
    ),
    missingAngles: z.array(z.string()),
    cautions: z.array(z.string()),
    coverageScore: CoverageScoreSchema
  }),
  ldsScholarship: z.object({
    summary: z.string().min(1),
    scholarlySources: z.array(
      z.object({
        author: z.string().min(1),
        title: z.string().min(1),
        publication: z.string().min(1),
        year: z.string().optional(),
        sourceType: z.enum([
          "BYU Studies",
          "Religious Educator",
          "Interpreter",
          "Maxwell Institute",
          "Book",
          "Journal Article",
          "Scripture Central",
          "FAIR",
          "Other"
        ]),
        mainContribution: z.string().min(1),
        relevance: z.string().min(1),
        citationUrl: z.string().url().optional()
      })
    ),
    scholarlyConsensus: z.string().optional(),
    contestedQuestions: z.array(z.string()),
    missingSources: z.array(z.string()),
    cautions: z.array(z.string()),
    coverageScore: CoverageScoreSchema
  }),
  supportAssessment: z.object({
    classification: z.enum([
      "Well-supported",
      "Moderately supported",
      "Textually weak",
      "Speculative"
    ]),
    explanation: z.string().min(1)
  }),
  doctrinalCautions: z.array(z.string()),
  missingEvidence: z.array(z.string()),
  revisionSuggestions: z.array(z.string()),
  readingPath: z.object({
    scriptures: z.array(SourceCardSchema),
    modernProphetic: z.array(SourceCardSchema),
    scholarship: z.array(SourceCardSchema)
  }),
  scores: z.object({
    scripturalGrounding: z.number().int().min(0).max(25),
    doctrinalSoundness: z.number().int().min(0).max(20),
    propheticSupport: z.number().int().min(0).max(15),
    scholarlySupport: z.number().int().min(0).max(15),
    interpretiveNuance: z.number().int().min(0).max(10),
    pastoralUsefulness: z.number().int().min(0).max(10),
    citationQuality: z.number().int().min(0).max(5),
    total: z.number().int().min(0).max(100)
  }),
  closingReminder: z.string().min(1)
}).superRefine((result, context) => {
  const scoreTotal =
    result.scores.scripturalGrounding +
    result.scores.doctrinalSoundness +
    result.scores.propheticSupport +
    result.scores.scholarlySupport +
    result.scores.interpretiveNuance +
    result.scores.pastoralUsefulness +
    result.scores.citationQuality;

  if (result.scores.total !== scoreTotal) {
    context.addIssue({
      code: "custom",
      path: ["scores", "total"],
      message: `Score total must equal component sum (${scoreTotal}).`
    });
  }
});
export type StandardExegesisEvaluation = z.infer<typeof StandardExegesisEvaluationSchema>;

export const STANDARD_EVALUATION_SCHEMA_NAME = "StandardExegesisEvaluation" as const;
