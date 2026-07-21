import { z } from "zod";
import { SchemaCitationValidator, zodIssuesToValidationErrors } from "../services/citations/index.js";
import { FixtureScriptureProvider, type ScriptureProvider } from "../services/scriptures/index.js";
import {
  FixturePropheticSourceProvider,
  FixtureScholarshipProvider,
  type PropheticSourceProvider,
  type ScholarshipProvider
} from "../services/sources/index.js";
import {
  EvaluateExegesisContractInputSchema,
  type EvaluateExegesisContractOutput,
  FetchScriptureReferenceInputSchema,
  type FetchScriptureReferenceOutput,
  FindExegesisSourcesInputSchema,
  type FindExegesisSourcesInput,
  type RenderExegesisResultOutput,
  RenderExegesisResultInputSchema,
  STANDARD_EVALUATION_SCHEMA_NAME,
  type ExegesisUiCard,
  type ExegesisUiPayload,
  type SourceCard
} from "../schemas/index.js";
import { EVALUATION_CONSTRAINTS, EVALUATION_RUBRIC, INSTRUCTIONS_VERSION, REQUIRED_SECTIONS } from "./contract.js";

export type ExegesisToolDependencies = {
  scriptureProvider: ScriptureProvider;
  propheticSourceProvider: PropheticSourceProvider;
  scholarshipProvider: ScholarshipProvider;
  citationValidator: SchemaCitationValidator;
};

export function createDefaultToolDependencies(): ExegesisToolDependencies {
  return {
    scriptureProvider: new FixtureScriptureProvider(),
    propheticSourceProvider: new FixturePropheticSourceProvider(),
    scholarshipProvider: new FixtureScholarshipProvider(),
    citationValidator: new SchemaCitationValidator()
  };
}

function isParseError(value: unknown): value is { ok: false; code: string; message: string } {
  return Boolean(value && typeof value === "object" && "ok" in value && (value as { ok?: unknown }).ok === false);
}

function scripturePassageToSourceCard(passage: {
  reference: string;
  book: string;
  sourceName: string;
  sourceUrl?: string;
  licenseNote?: string;
}): SourceCard {
  return {
    title: passage.reference,
    sourceType: "scripture",
    reference: passage.reference,
    citationUrl: passage.sourceUrl,
    sourceName: passage.sourceName,
    shortDescription: passage.licenseNote,
    relevance: "Candidate scripture source returned by deterministic reference parsing/fetching."
  };
}

export async function fetchScriptureReference(
  rawInput: z.input<typeof FetchScriptureReferenceInputSchema>,
  dependencies = createDefaultToolDependencies()
): Promise<FetchScriptureReferenceOutput> {
  const input = FetchScriptureReferenceInputSchema.parse(rawInput);
  const parsed = dependencies.scriptureProvider.parseReference(input.reference);

  if (isParseError(parsed)) {
    return {
      ok: false,
      errors: [{ code: parsed.code, message: parsed.message }]
    };
  }

  const reference = input.corpus ? { ...parsed, corpus: input.corpus } : parsed;
  return dependencies.scriptureProvider.fetchReference(reference);
}

export async function findExegesisSources(
  rawInput: z.input<typeof FindExegesisSourcesInputSchema>,
  dependencies = createDefaultToolDependencies()
) {
  const input = FindExegesisSourcesInputSchema.parse(rawInput);
  const scriptureSources: SourceCard[] = [];
  const notes: string[] = [];
  const limitations: string[] = [];

  if (input.sourceTypes.includes("scripture")) {
    if (input.passage) {
      const fetched = await fetchScriptureReference({ reference: input.passage }, dependencies);
      if (fetched.ok && fetched.passages) {
        scriptureSources.push(...fetched.passages.map(scripturePassageToSourceCard));
      } else {
        limitations.push(...(fetched.errors ?? []).map((error) => error.message));
      }
    } else if (input.topic && dependencies.scriptureProvider.search) {
      const searchResult = await dependencies.scriptureProvider.search(input.topic, {
        limit: input.depth === "deep" ? 10 : input.depth === "standard" ? 5 : 3
      });
      scriptureSources.push(...searchResult.sources.map(scripturePassageToSourceCard));
      notes.push(...searchResult.notes);
    } else {
      limitations.push("Scripture source lookup needs a passage or a topic query.");
    }
  }

  const modernPropheticSources = input.sourceTypes.includes("modern_prophetic")
    ? await dependencies.propheticSourceProvider.search(input)
    : [];
  const ldsScholarshipSources = input.sourceTypes.includes("lds_scholarship")
    ? await dependencies.scholarshipProvider.search(input)
    : [];

  if (input.sourceTypes.includes("modern_prophetic") && modernPropheticSources.length === 0) {
    limitations.push(
      "No modern prophetic source candidates matched the current local fixture index. Broader provider search is deferred."
    );
  }

  if (input.sourceTypes.includes("lds_scholarship") && ldsScholarshipSources.length === 0) {
    limitations.push(
      "No LDS scholarship source candidates matched the current local fixture index. Broader provider search is deferred."
    );
  }

  if (modernPropheticSources.length > 0 || ldsScholarshipSources.length > 0) {
    notes.push(
      "Modern prophetic and scholarship results are metadata-only source candidates from a curated local fixture index; verify source text directly before quoting."
    );
  }

  return {
    scriptureSources,
    modernPropheticSources,
    ldsScholarshipSources,
    notes,
    limitations
  };
}

export async function evaluateExegesisContract(
  rawInput: z.input<typeof EvaluateExegesisContractInputSchema>,
  dependencies = createDefaultToolDependencies()
): Promise<EvaluateExegesisContractOutput> {
  const input = EvaluateExegesisContractInputSchema.parse(rawInput);
  const sourceCandidates = await findExegesisSources(
    {
      topic: input.topic,
      passage: input.passage,
      sourceTypes: ["scripture", "modern_prophetic", "lds_scholarship"],
      depth: input.requestedDepth
    },
    dependencies
  );

  const fetchedScriptures = input.passage
    ? (await fetchScriptureReference({ reference: input.passage }, dependencies)).passages
    : undefined;

  return {
    instructionsVersion: INSTRUCTIONS_VERSION,
    requiredSections: REQUIRED_SECTIONS,
    rubric: EVALUATION_RUBRIC,
    sourceContext: {
      fetchedScriptures,
      sourceCandidates
    },
    outputSchemaName: STANDARD_EVALUATION_SCHEMA_NAME,
    constraints: EVALUATION_CONSTRAINTS
  };
}

export function renderExegesisResult(rawInput: unknown): RenderExegesisResultOutput {
  const parsedInput = RenderExegesisResultInputSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    return {
      ok: false,
      validationErrors: zodIssuesToValidationErrors(parsedInput.error)
    };
  }

  const validator = new SchemaCitationValidator();
  const validation = validator.validateEvaluation(parsedInput.data.result);

  if (!validation.ok) {
    return {
      ok: false,
      validationErrors: validation.errors
    };
  }

  return {
    ok: true,
    result: parsedInput.data.result,
    ui: buildExegesisUiPayload(parsedInput.data.result)
  };
}

function buildExegesisUiPayload(result: NonNullable<RenderExegesisResultOutput["result"]>): ExegesisUiPayload {
  return {
    title: result.topic ?? result.passage ?? "Exegesis Evaluation",
    subtitle: result.passage,
    summary: result.interpretationSummary.text,
    supportAssessment: result.supportAssessment,
    score: {
      total: result.scores.total,
      label: `${result.scores.total}/100`
    },
    sections: {
      textualGrounding: result.textualGrounding.supportingReferences.map((reference) => ({
        title: reference.normalizedReference ?? reference.reference,
        subtitle: reference.sourceName,
        body: reference.relevance ?? result.textualGrounding.explanation,
        badge: "Scripture",
        links: reference.citationUrl ? [{ label: "Open source", url: reference.citationUrl }] : []
      })),
      modernPropheticWitnesses: result.modernPropheticWitnesses.quoteCards.map((card) => ({
        title: card.sourceTitle,
        subtitle: [card.speaker, card.roleAtTime, card.date].filter(Boolean).join(" | "),
        body: card.relevance,
        badge: card.sourceType,
        links: card.citationUrl ? [{ label: "Open source", url: card.citationUrl }] : []
      })),
      ldsScholarship: result.ldsScholarship.scholarlySources.map((source) => ({
        title: source.title,
        subtitle: [source.author, source.publication, source.year].filter(Boolean).join(" | "),
        body: `${source.mainContribution} ${source.relevance}`,
        badge: source.sourceType,
        links: source.citationUrl ? [{ label: "Open source", url: source.citationUrl }] : []
      })),
      assumptions: result.assumptionsAudit.map((assumption) => ({
        title: assumption.assumption,
        body: assumption.impact,
        badge: `Confidence: ${assumption.confidence}`,
        links: []
      })),
      alternatives: result.alternativePlausibleReadings.map((reading) => ({
        title: reading.reading,
        subtitle: reading.supportingReferences.map((reference) => reference.normalizedReference ?? reference.reference).join(", "),
        body: reading.explanation,
        badge: "Alternative",
        links: []
      })),
      cautions: textListToCards("Doctrinal caution", result.doctrinalCautions).concat(
        textListToCards("Missing evidence", result.missingEvidence),
        textListToCards("Revision suggestion", result.revisionSuggestions)
      )
    },
    closingReminder: result.closingReminder
  };
}

function textListToCards(label: string, values: string[]): ExegesisUiCard[] {
  return values.map((value, index) => ({
    title: `${label} ${index + 1}`,
    body: value,
    badge: label,
    links: []
  }));
}
