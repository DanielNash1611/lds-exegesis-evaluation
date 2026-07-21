import { z } from "zod";

export const ExegesisUiLinkSchema = z.object({
  label: z.string(),
  url: z.string().url().optional()
});
export type ExegesisUiLink = z.infer<typeof ExegesisUiLinkSchema>;

export const ExegesisUiCardSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  body: z.string(),
  badge: z.string().optional(),
  links: z.array(ExegesisUiLinkSchema).default([])
});
export type ExegesisUiCard = z.infer<typeof ExegesisUiCardSchema>;

export const ExegesisUiPayloadSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  summary: z.string(),
  supportAssessment: z.object({
    classification: z.string(),
    explanation: z.string()
  }),
  score: z.object({
    total: z.number().int().min(0).max(100),
    label: z.string()
  }),
  sections: z.object({
    textualGrounding: z.array(ExegesisUiCardSchema),
    modernPropheticWitnesses: z.array(ExegesisUiCardSchema),
    ldsScholarship: z.array(ExegesisUiCardSchema),
    assumptions: z.array(ExegesisUiCardSchema),
    alternatives: z.array(ExegesisUiCardSchema),
    cautions: z.array(ExegesisUiCardSchema)
  }),
  closingReminder: z.string()
});
export type ExegesisUiPayload = z.infer<typeof ExegesisUiPayloadSchema>;
