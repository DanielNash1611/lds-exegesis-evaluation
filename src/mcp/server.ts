import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { fileURLToPath } from "node:url";
import {
  EvaluateExegesisContractInputSchema,
  EvaluateExegesisContractOutputSchema,
  FetchScriptureReferenceInputSchema,
  FetchScriptureReferenceOutputSchema,
  FindExegesisSourcesInputSchema,
  RenderExegesisResultInputSchema,
  RenderExegesisResultOutputSchema,
  SourceSearchResultSchema
} from "../schemas/index.js";
import { EXEGESIS_SERVER_INSTRUCTIONS } from "./contract.js";
import {
  evaluateExegesisContract,
  fetchScriptureReference,
  findExegesisSources,
  renderExegesisResult
} from "./tools.js";
import { readProjectFileText } from "../services/project-file.js";

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

export const EXEGESIS_RESULT_WIDGET_URI = "ui://exegesis/result-v1.html";

const EXEGESIS_WIDGET_DESCRIPTION =
  "Displays a validated LDS exegesis evaluation with its support score, scripture grounding, modern prophetic witnesses, LDS scholarship, assumptions, alternative readings, and cautions.";

function textResult(text: string, structuredContent: unknown) {
  return {
    content: [{ type: "text" as const, text }],
    structuredContent: structuredContent as Record<string, unknown>
  };
}

export function createExegesisMcpServer() {
  const server = new McpServer(
    { name: "lds-exegesis-evaluation-assistant", version: "0.1.0" },
    { instructions: EXEGESIS_SERVER_INSTRUCTIONS }
  );

  registerAppResource(
    server,
    "Exegesis Result",
    EXEGESIS_RESULT_WIDGET_URI,
    {
      title: "Exegesis Result",
      description: "Renders validated exegesis evaluation sections as inspectable cards.",
      _meta: {
        "openai/widgetDescription": EXEGESIS_WIDGET_DESCRIPTION,
        ui: {
          prefersBorder: true,
          csp: {
            connectDomains: [],
            resourceDomains: []
          }
        }
      }
    },
    async () => ({
      contents: [
        {
          uri: EXEGESIS_RESULT_WIDGET_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: readProjectFileText("web/exegesis-result.html"),
          _meta: {
            "openai/widgetDescription": EXEGESIS_WIDGET_DESCRIPTION,
            ui: {
              prefersBorder: true,
              csp: {
                connectDomains: [],
                resourceDomains: []
              }
            }
          }
        }
      ]
    })
  );

  server.registerTool(
    "fetch_scripture_reference",
    {
      title: "Fetch scripture reference",
      description:
        "Use this when ChatGPT needs deterministic parsing and fixture-backed scripture text for one scripture reference or same-chapter range.",
      inputSchema: FetchScriptureReferenceInputSchema.shape,
      outputSchema: FetchScriptureReferenceOutputSchema.shape,
      annotations: READ_ONLY_ANNOTATIONS
    },
    async (input) => {
      const output = await fetchScriptureReference(input);
      return textResult(
        output.ok
          ? `Fetched ${output.normalizedReference ?? "scripture reference"}.`
          : "Unable to fetch scripture reference.",
        output
      );
    }
  );

  server.registerTool(
    "find_exegesis_sources",
    {
      title: "Find exegesis source candidates",
      description:
        "Use this when ChatGPT needs deterministic source cards for scripture, modern prophetic witnesses, or LDS scholarship before writing an evaluation.",
      inputSchema: FindExegesisSourcesInputSchema.shape,
      outputSchema: SourceSearchResultSchema.shape,
      annotations: READ_ONLY_ANNOTATIONS
    },
    async (input) => {
      const output = await findExegesisSources(input);
      return textResult("Returned exegesis source candidates and known limitations.", output);
    }
  );

  server.registerTool(
    "evaluate_exegesis_contract",
    {
      title: "Get exegesis evaluation contract",
      description:
        "Use this when ChatGPT needs the required LDS exegesis evaluation structure, rubric, constraints, and deterministic source context. This tool does not perform LLM evaluation.",
      inputSchema: EvaluateExegesisContractInputSchema.shape,
      outputSchema: EvaluateExegesisContractOutputSchema.shape,
      annotations: READ_ONLY_ANNOTATIONS
    },
    async (input) => {
      const output = await evaluateExegesisContract(input);
      return textResult("Returned the standard exegesis evaluation contract.", output);
    }
  );

  registerAppTool(
    server,
    "render_exegesis_result",
    {
      title: "Validate exegesis result",
      description:
        "Use this when ChatGPT has produced a StandardExegesisEvaluation payload and needs schema validation before future UI rendering.",
      inputSchema: RenderExegesisResultInputSchema.shape,
      outputSchema: RenderExegesisResultOutputSchema.shape,
      annotations: READ_ONLY_ANNOTATIONS,
      _meta: {
        ui: {
          resourceUri: EXEGESIS_RESULT_WIDGET_URI
        },
        "openai/outputTemplate": EXEGESIS_RESULT_WIDGET_URI
      }
    },
    async (input) => {
      const output = renderExegesisResult(input);
      return textResult(output.ok ? "Validated exegesis result." : "Exegesis result failed validation.", output);
    }
  );

  return server;
}

async function main() {
  const server = createExegesisMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  await main();
}
