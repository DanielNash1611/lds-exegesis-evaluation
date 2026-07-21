import type { EvaluationRubric } from "../schemas/evaluation.js";

export const INSTRUCTIONS_VERSION = "lds-exegesis-evaluation-contract@0.1.0";

export const REQUIRED_SECTIONS = [
  "Interpretation summary",
  "Textual grounding",
  "Immediate context",
  "Canonical context",
  "Genre and intent",
  "Assumptions audit",
  "Alternative plausible readings",
  "Modern prophetic quotes / witnesses on the topic",
  "What LDS scholars have published on the subject",
  "Support assessment (non-authoritative)",
  "Doctrinal cautions",
  "Missing evidence",
  "Revision suggestions",
  "Reading path",
  "Scores",
  "Closing reminder"
];

export const EVALUATION_RUBRIC: EvaluationRubric = {
  categories: [
    {
      name: "scripturalGrounding",
      maxScore: 25,
      description: "Specific, precise use of cited scriptural references and immediate textual evidence."
    },
    {
      name: "doctrinalSoundness",
      maxScore: 20,
      description: "Careful, non-authoritative treatment that avoids overclaiming or settling doctrine."
    },
    {
      name: "propheticSupport",
      maxScore: 15,
      description: "Relevant modern prophetic witnesses, with short quotations or metadata only."
    },
    {
      name: "scholarlySupport",
      maxScore: 15,
      description: "Relevant LDS scholarship, represented with citation metadata and contribution summaries."
    },
    {
      name: "interpretiveNuance",
      maxScore: 10,
      description: "Clear assumptions audit and at least one plausible alternative reading."
    },
    {
      name: "pastoralUsefulness",
      maxScore: 10,
      description: "Charitable, precise, and useful feedback without devotional or persuasive pressure."
    },
    {
      name: "citationQuality",
      maxScore: 5,
      description: "References, source cards, links, and limitations are clear enough to inspect."
    }
  ],
  supportClassifications: ["Well-supported", "Moderately supported", "Textually weak", "Speculative"]
};

export const EVALUATION_CONSTRAINTS = [
  "Evaluate interpretations as hypotheses; do not evaluate the person making the claim.",
  "Do not interpret scripture authoritatively, declare doctrine, or claim a passage definitively settles a doctrine.",
  "Use careful language such as 'One plausible reading is...' and 'This interpretation is moderately supported because...'.",
  "Prefer exact references over long quotations; if quoting scripture or modern sources, keep excerpts short.",
  "Do not reproduce manuals, footnotes, study helps, or long copyrighted quotations.",
  "Include a 4-6 sentence interpretation summary before deeper analytical sections.",
  "Label detailed sections as 'Deeper Analysis (optional)' when producing prose for a user.",
  "Always include modern prophetic witnesses and LDS scholarship sections, even when source coverage is limited.",
  "Include both strengthening and complicating canonical context where available.",
  "Always include an assumptions audit, at least one alternative plausible reading, and a non-authoritative support assessment.",
  "Close by reminding the user to read cited passages directly and consider multiple perspectives.",
  "The MCP server provides deterministic retrieval, validation, schemas, and source context only; it must not call a second LLM."
];

export const EXEGESIS_SERVER_INSTRUCTIONS = [
  "LDS exegesis evaluation assistant support server: provide deterministic scripture parsing/fetching, source cards, schema contracts, and validation only.",
  "Do not synthesize evaluations or call a second LLM. ChatGPT remains the reasoning layer.",
  "All outputs must preserve non-authoritative evaluation behavior: no doctrinal declarations, no binding conclusions, reference-first, concise excerpts only.",
  "Required evaluation outputs must include modern prophetic witnesses and LDS scholarship sections."
].join(" ");
