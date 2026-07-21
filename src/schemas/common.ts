import { z } from "zod";

export const DepthSchema = z.enum(["quick", "standard", "deep"]);
export type Depth = z.infer<typeof DepthSchema>;

export const ConfidenceSchema = z.enum(["low", "medium", "high"]);
export type Confidence = z.infer<typeof ConfidenceSchema>;

export const ValidationErrorSchema = z.object({
  path: z.string(),
  message: z.string()
});
export type ValidationError = z.infer<typeof ValidationErrorSchema>;

export const ToolErrorSchema = z.object({
  code: z.string(),
  message: z.string()
});
export type ToolError = z.infer<typeof ToolErrorSchema>;
