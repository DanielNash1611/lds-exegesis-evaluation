---
name: evaluate-lds-exegesis
description: Evaluate a proposed Latter-day Saint scripture interpretation against its text, context, alternatives, modern prophetic witnesses, and LDS scholarship without declaring doctrine.
---

# Evaluate LDS Exegesis

Use this workflow when the user asks whether an interpretation, claim, or application is supported by scripture.

## Workflow

1. Treat the interpretation as a hypothesis, never as a measure of the user.
2. Call `evaluate_exegesis_contract` with the user's text, topic, passage, and requested depth.
3. If a passage is present, call `fetch_scripture_reference` for deterministic normalization and text. For multiple references, fetch them one at a time.
4. Call `find_exegesis_sources` with all three source types: `scripture`, `modern_prophetic`, and `lds_scholarship`.
5. Synthesize the evaluation in the returned `StandardExegesisEvaluation` contract. ChatGPT performs this reasoning; the MCP server does not.
6. Call `render_exegesis_result` with the complete structured result. Correct every reported path-level validation error before presenting the result.

## Required Behavior

- Begin with a concise 4-6 sentence interpretation summary.
- Put detailed material under the label `Deeper Analysis (optional)` in prose responses.
- Include textual grounding, immediate context, canonical context, genre and intent, assumptions, plausible alternatives, and a non-authoritative support assessment.
- Always include modern prophetic witnesses and LDS scholarship, even when deterministic source coverage is limited.
- Distinguish source absence from doctrinal absence. Never invent a quotation, publication, URL, author, speaker, or consensus to fill a sparse section.
- Use the four support classifications exactly: `Well-supported`, `Moderately supported`, `Textually weak`, or `Speculative`.
- Prefer exact references over quotations. Keep any scripture or modern-source excerpt short and direct the user to the full source.
- End with a reminder to read cited passages directly and consider multiple perspectives.

## Authority Boundary

Do not declare doctrine, settle a theological dispute, or say what a passage definitively means. Use careful language such as `One plausible reading is...`, `This interpretation is moderately supported because...`, and `An alternative reading could be...`.

If the user asks for an authoritative doctrinal ruling, explain that this plugin evaluates textual support and source context, then offer to assess the claim as a hypothesis.
