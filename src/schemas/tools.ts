import { z } from "zod";
import { DepthSchema, ToolErrorSchema, ValidationErrorSchema } from "./common.js";
import { EvaluationRubricSchema, StandardExegesisEvaluationSchema } from "./evaluation.js";
import { CorpusSchema, ScripturePassageSchema } from "./scriptures.js";
import { PropheticSourceCardSchema, ScholarlySourceCardSchema, SourceCardSchema } from "./sources.js";
import { ExegesisUiPayloadSchema } from "./ui.js";

export const FetchScriptureReferenceInputSchema = z.object({
  reference: z.string().min(1),
  corpus: CorpusSchema.optional()
});
export type FetchScriptureReferenceInput = z.infer<typeof FetchScriptureReferenceInputSchema>;

export const FetchScriptureReferenceOutputSchema = z.object({
  ok: z.boolean(),
  normalizedReference: z.string().optional(),
  passages: z.array(ScripturePassageSchema).optional(),
  errors: z.array(ToolErrorSchema).optional()
});
export type FetchScriptureReferenceOutput = z.infer<typeof FetchScriptureReferenceOutputSchema>;

export const FindExegesisSourcesInputSchema = z.object({
  topic: z.string().optional(),
  passage: z.string().optional(),
  sourceTypes: z.array(z.enum(["scripture", "modern_prophetic", "lds_scholarship"])).min(1),
  depth: DepthSchema
});
export type FindExegesisSourcesInput = z.infer<typeof FindExegesisSourcesInputSchema>;

export const SourceSearchResultSchema = z.object({
  scriptureSources: z.array(SourceCardSchema),
  modernPropheticSources: z.array(PropheticSourceCardSchema),
  ldsScholarshipSources: z.array(ScholarlySourceCardSchema),
  notes: z.array(z.string()),
  limitations: z.array(z.string())
});
export type SourceSearchResult = z.infer<typeof SourceSearchResultSchema>;

export const EvaluateExegesisContractInputSchema = z.object({
  userText: z.string().min(1),
  topic: z.string().optional(),
  passage: z.string().optional(),
  requestedDepth: DepthSchema
});
export type EvaluateExegesisContractInput = z.infer<typeof EvaluateExegesisContractInputSchema>;

export const EvaluateExegesisContractOutputSchema = z.object({
  instructionsVersion: z.string(),
  requiredSections: z.array(z.string()),
  rubric: EvaluationRubricSchema,
  sourceContext: z.object({
    fetchedScriptures: z.array(ScripturePassageSchema).optional(),
    sourceCandidates: SourceSearchResultSchema.optional()
  }),
  outputSchemaName: z.literal("StandardExegesisEvaluation"),
  constraints: z.array(z.string())
});
export type EvaluateExegesisContractOutput = z.infer<typeof EvaluateExegesisContractOutputSchema>;

export const RenderExegesisResultInputSchema = z.object({
  result: StandardExegesisEvaluationSchema
});
export type RenderExegesisResultInput = z.infer<typeof RenderExegesisResultInputSchema>;

export const RenderExegesisResultOutputSchema = z.object({
  ok: z.boolean(),
  result: StandardExegesisEvaluationSchema.optional(),
  ui: ExegesisUiPayloadSchema.optional(),
  validationErrors: z.array(ValidationErrorSchema).optional()
});
export type RenderExegesisResultOutput = z.infer<typeof RenderExegesisResultOutputSchema>;
