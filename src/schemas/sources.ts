import { z } from "zod";

export const SourceTypeSchema = z.enum([
  "scripture",
  "modern_prophetic",
  "lds_scholarship",
  "official_church",
  "other"
]);

export const SourceCardSchema = z.object({
  title: z.string().min(1),
  sourceType: SourceTypeSchema,
  reference: z.string().optional(),
  citationUrl: z.string().url().optional(),
  sourceName: z.string().optional(),
  shortDescription: z.string().optional(),
  relevance: z.string().optional()
});
export type SourceCard = z.infer<typeof SourceCardSchema>;

export const ScriptureReferenceCardSchema = SourceCardSchema.extend({
  sourceType: z.literal("scripture"),
  reference: z.string().min(1),
  normalizedReference: z.string().optional(),
  textExcerpt: z.string().max(280, "Text excerpts should stay short and reference-first.").optional()
});
export type ScriptureReferenceCard = z.infer<typeof ScriptureReferenceCardSchema>;

export const PropheticSourceCardSchema = SourceCardSchema.extend({
  sourceType: z.literal("modern_prophetic"),
  speaker: z.string().min(1),
  roleAtTime: z.string().optional(),
  sourceTitle: z.string().min(1),
  churchSourceType: z.enum([
    "general_conference",
    "manual",
    "church_magazine",
    "official_statement",
    "other"
  ]),
  date: z.string().optional(),
  shortQuote: z.string().max(280, "Modern-source quotes must stay short.").optional()
});
export type PropheticSourceCard = z.infer<typeof PropheticSourceCardSchema>;

export const ScholarlySourceCardSchema = SourceCardSchema.extend({
  sourceType: z.literal("lds_scholarship"),
  author: z.string().min(1),
  title: z.string().min(1),
  publication: z.string().min(1),
  year: z.string().optional(),
  scholarlySourceType: z.enum([
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
  mainContribution: z.string().min(1)
});
export type ScholarlySourceCard = z.infer<typeof ScholarlySourceCardSchema>;
