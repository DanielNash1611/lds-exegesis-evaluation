import { describe, expect, it } from "vitest";
import { StandardExegesisEvaluationSchema } from "../src/schemas/index.js";

import { completeEvaluation } from "./fixtures/evaluation.js";

describe("StandardExegesisEvaluation schema", () => {
  it("passes for a complete standard evaluation", () => {
    const parsed = StandardExegesisEvaluationSchema.safeParse(completeEvaluation());
    expect(parsed.success).toBe(true);
  });

  it("fails when modern prophetic witnesses are missing", () => {
    const incomplete = completeEvaluation() as Record<string, unknown>;
    delete incomplete.modernPropheticWitnesses;

    const parsed = StandardExegesisEvaluationSchema.safeParse(incomplete);
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.map((issue) => issue.path.join("."))).toContain("modernPropheticWitnesses");
  });

  it("fails when LDS scholarship is missing", () => {
    const incomplete = completeEvaluation() as Record<string, unknown>;
    delete incomplete.ldsScholarship;

    const parsed = StandardExegesisEvaluationSchema.safeParse(incomplete);
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues.map((issue) => issue.path.join("."))).toContain("ldsScholarship");
  });

  it("fails when score total does not equal component scores", () => {
    const evaluation = completeEvaluation();
    evaluation.scores.total = 55;

    const parsed = StandardExegesisEvaluationSchema.safeParse(evaluation);
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.path.join(".")).toBe("scores.total");
  });
});
