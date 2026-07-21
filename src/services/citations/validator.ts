import type { z } from "zod";
import {
  SourceCardSchema,
  type SourceCard,
  StandardExegesisEvaluationSchema,
  type StandardExegesisEvaluation,
  type ValidationError
} from "../../schemas/index.js";

export type CitationValidationResult = {
  ok: boolean;
  errors: ValidationError[];
};

export interface CitationValidator {
  validateSourceCard(card: SourceCard): CitationValidationResult;
  validateEvaluation(result: StandardExegesisEvaluation): CitationValidationResult;
}

export function zodIssuesToValidationErrors(error: z.ZodError): ValidationError[] {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "$",
    message: issue.message
  }));
}

export class SchemaCitationValidator implements CitationValidator {
  validateSourceCard(card: SourceCard): CitationValidationResult {
    const parsed = SourceCardSchema.safeParse(card);
    if (!parsed.success) {
      return { ok: false, errors: zodIssuesToValidationErrors(parsed.error) };
    }

    const errors = sourceCardCitationErrors(parsed.data, "$");
    return { ok: errors.length === 0, errors };
  }

  validateEvaluation(result: StandardExegesisEvaluation): CitationValidationResult {
    const parsed = StandardExegesisEvaluationSchema.safeParse(result);
    if (!parsed.success) {
      return { ok: false, errors: zodIssuesToValidationErrors(parsed.error) };
    }

    const errors: ValidationError[] = [];
    parsed.data.modernPropheticWitnesses.quoteCards.forEach((card, index) => {
      if (!card.citationUrl) {
        errors.push({
          path: `modernPropheticWitnesses.quoteCards.${index}.citationUrl`,
          message: "Modern prophetic source cards must include a citationUrl before rendering."
        });
      }
    });

    parsed.data.ldsScholarship.scholarlySources.forEach((card, index) => {
      if (!card.citationUrl) {
        errors.push({
          path: `ldsScholarship.scholarlySources.${index}.citationUrl`,
          message: "LDS scholarship source cards must include a citationUrl before rendering."
        });
      }
    });

    parsed.data.readingPath.scriptures.forEach((card, index) => {
      errors.push(...sourceCardCitationErrors(card, `readingPath.scriptures.${index}`));
    });
    parsed.data.readingPath.modernProphetic.forEach((card, index) => {
      errors.push(...sourceCardCitationErrors(card, `readingPath.modernProphetic.${index}`));
    });
    parsed.data.readingPath.scholarship.forEach((card, index) => {
      errors.push(...sourceCardCitationErrors(card, `readingPath.scholarship.${index}`));
    });

    return { ok: errors.length === 0, errors };
  }
}

function sourceCardCitationErrors(card: SourceCard, path: string): ValidationError[] {
  if (card.sourceType !== "scripture" && !card.citationUrl) {
    return [
      {
        path: `${path}.citationUrl`,
        message: "Non-scripture source cards must include a citationUrl before rendering."
      }
    ];
  }

  if (card.sourceType === "scripture" && !card.reference) {
    return [
      {
        path: `${path}.reference`,
        message: "Scripture source cards must include a precise reference."
      }
    ];
  }

  return [];
}
