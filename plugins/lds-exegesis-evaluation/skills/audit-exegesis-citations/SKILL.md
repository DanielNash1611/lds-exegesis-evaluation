---
name: audit-exegesis-citations
description: Audit a structured LDS exegesis evaluation for required sections, score integrity, source traceability, quotation restraint, and non-authoritative language.
---

# Audit Exegesis Citations

Use this workflow when the user has a draft evaluation or asks whether an evaluation is ready to present.

## Audit Sequence

1. Confirm that the payload includes `modernPropheticWitnesses` and `ldsScholarship` as first-class sections.
2. Check scripture cards against `fetch_scripture_reference` when the fixture provider covers the cited passage.
3. Use `find_exegesis_sources` to compare modern prophetic and scholarly cards with deterministic candidates.
4. Reject invented quotations, unattributed excerpts, broken source identity, and claims of scholarly consensus that the returned source set cannot support.
5. Confirm each component score is within its allowed range and that `scores.total` equals the component sum.
6. Call `render_exegesis_result` for schema and UI-payload validation. Report every validation error with its path and required correction.

## Review Standard

Passing schema validation establishes structural correctness, not doctrinal correctness or source completeness. Flag authoritative phrasing, long quotations, missing limitations, and conclusions that outrun the cited evidence even when the payload is schema-valid.
