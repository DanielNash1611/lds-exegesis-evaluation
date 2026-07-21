import { describe, expect, it } from "vitest";
import { evaluateExegesisContract, renderExegesisResult } from "../src/mcp/tools.js";
import { createExegesisMcpServer } from "../src/mcp/server.js";
import { completeEvaluation } from "./evaluation-schema.test.js";

describe("MCP tool handlers", () => {
  it("returns helpful validation errors from render_exegesis_result", () => {
    const evaluation = completeEvaluation() as Record<string, unknown>;
    delete evaluation.modernPropheticWitnesses;

    const result = renderExegesisResult({ result: evaluation });

    expect(result.ok).toBe(false);
    expect(result.validationErrors?.some((error) => error.path === "result.modernPropheticWitnesses")).toBe(true);
  });

  it("preserves Custom GPT constraints and Tyler's two new sections in the evaluation contract", async () => {
    const contract = await evaluateExegesisContract({
      userText: "Does Mosiah 2:17 define service as worship?",
      passage: "Mosiah 2:17",
      requestedDepth: "standard"
    });

    expect(contract.requiredSections).toContain("Modern prophetic quotes / witnesses on the topic");
    expect(contract.requiredSections).toContain("What LDS scholars have published on the subject");
    expect(contract.constraints.join(" ")).toContain("Do not interpret scripture authoritatively");
    expect(contract.constraints.join(" ")).toContain("Prefer exact references");
    expect(contract.constraints.join(" ")).toContain("must not call a second LLM");
    expect(contract.outputSchemaName).toBe("StandardExegesisEvaluation");
    expect(contract.sourceContext.fetchedScriptures?.[0]?.reference).toBe("Mosiah 2:17");
  });

  it("returns a card-oriented UI payload from render_exegesis_result", () => {
    const result = renderExegesisResult({ result: completeEvaluation() });

    expect(result.ok).toBe(true);
    expect(result.ui?.title).toBe("service as worship");
    expect(result.ui?.sections.textualGrounding[0]?.title).toBe("Mosiah 2:17");
    expect(result.ui?.supportAssessment.classification).toBe("Moderately supported");
    expect(result.ui?.score.label).toBe("56/100");
  });

  it("constructs the MCP server with app resources registered", () => {
    const server = createExegesisMcpServer();

    expect(server.isConnected()).toBe(false);
  });
});
