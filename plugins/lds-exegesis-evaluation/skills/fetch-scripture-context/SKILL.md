---
name: fetch-scripture-context
description: Parse, normalize, and fetch an LDS standard-works or KJV scripture reference deterministically before analysis.
---

# Fetch Scripture Context

Use this workflow when the user supplies a scripture reference, asks for its text, or needs a reference normalized before evaluation.

## Workflow

1. Call `fetch_scripture_reference` with the exact user input.
2. Preserve the returned `normalizedReference`, source name, source URL, and license note.
3. If the tool returns an unknown-book, malformed-reference, unsupported-range, or fixture-coverage error, report that limitation directly. Do not substitute remembered verse text.
4. For multiple references, make one tool call per reference because MVP parsing is intentionally single-reference.
5. Use fetched text only as source context. Prefer the precise reference in the response and quote no more than the short portion needed for analysis.

The fixture corpus is intentionally small. A successful parse does not guarantee that local text is available, and missing fixture text is not evidence about the scripture itself.
