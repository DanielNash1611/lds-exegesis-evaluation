// Enough for a complete evaluation card set; retrieval tools need far less.
export const INPUT_LIMITS = { bytes: 65_536, elements: 1024, string: 8192, depth: 16 } as const;

export class InputLimitError extends Error {
  constructor(message: string, readonly status = 413) { super(message); }
}

// Run before recursive SDK/Zod validation, including for unknown fields.
export function assertInputBudget(value: unknown): void {
  const pending: Array<{ value: unknown; depth: number }> = [{ value, depth: 0 }];
  let elements = 0;
  while (pending.length) {
    const { value: item, depth } = pending.pop()!;
    if (depth > INPUT_LIMITS.depth) throw new InputLimitError("JSON nesting exceeds the input limit.");
    if (typeof item === "string" && item.length > INPUT_LIMITS.string) throw new InputLimitError("JSON string exceeds the input limit.");
    if (item === null || typeof item !== "object") continue;
    const keys = Object.keys(item);
    elements += keys.length;
    if (elements > INPUT_LIMITS.elements) throw new InputLimitError("JSON elements exceed the input limit.");
    for (const key of keys) {
      if (key.length > INPUT_LIMITS.string) throw new InputLimitError("JSON key exceeds the input limit.");
      pending.push({ value: (item as Record<string, unknown>)[key], depth: depth + 1 });
    }
  }
}

