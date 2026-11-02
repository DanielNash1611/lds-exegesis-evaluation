import express, { type ErrorRequestHandler } from "express";
import { localhostHostValidation } from "@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js";
import { INPUT_LIMITS, assertInputBudget, InputLimitError } from "./input-limits.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Request, Response } from "express";
import { createExegesisMcpServer } from "./server.js";
import { createUsageRecorder } from "../analytics.js";

type HttpAppOptions = {
  host?: string;
};

export function createExegesisHttpApp(options: HttpAppOptions = {}) {
  const app = express();
  // Preserve the SDK helper's localhost DNS-rebinding check before reading bytes.
  if (["127.0.0.1", "localhost", "::1"].includes(options.host ?? "127.0.0.1")) app.use(localhostHostValidation());
  app.use("/mcp", (req, res, next) => {
    if (req.method === "POST" && !req.is("application/json")) {
      res.status(415).json({ error: "Content-Type must be application/json." });
      return;
    }
    next();
  });
  app.use("/mcp", express.json({ limit: INPUT_LIMITS.bytes, inflate: false }));
  app.use("/mcp", (req, _res, next) => {
    try {
      if (req.method === "POST") {
        if (req.body === undefined) throw new InputLimitError("JSON body is required.", 400);
        assertInputBudget(req.body);
      }
      next();
    } catch (error) { next(error); }
  });

  app.get("/", (req: Request, res: Response) => {
    const forwardedProto = req.header("x-forwarded-proto");
    const protocol = forwardedProto?.split(",")[0]?.trim() || req.protocol;
    const host = req.header("host");

    res.json({
      name: "lds-exegesis-evaluation-assistant",
      description: "Deterministic scripture retrieval and LDS exegesis evaluation contracts for ChatGPT.",
      mcp: host ? `${protocol}://${host}/mcp` : "/mcp",
      transport: "streamable-http",
      status: "ok"
    });
  });

  app.post("/mcp", async (req: Request, res: Response) => {
    const server = createExegesisMcpServer(createUsageRecorder(req.header("dnt") === "1" || req.header("sec-gpc") === "1"));
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      maxRequestBodySize: INPUT_LIMITS.bytes
    });

    res.on("close", () => {
      void transport.close();
      void server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error"
          },
          id: null
        });
      }
    }
  });

  app.get("/mcp", (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed. Use POST /mcp for stateless Streamable HTTP."
      },
      id: null
    });
  });

  app.delete("/mcp", (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed."
      },
      id: null
    });
  });

  const inputErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
    const status = error instanceof InputLimitError ? error.status : error.status;
    if (![400, 413, 415].includes(status)) { next(error); return; }
    res.status(status).json({ error: status === 413 ? "Request exceeds the input limits." : status === 415 ? "Use an uncompressed application/json body." : "Invalid JSON body." });
  };
  app.use(inputErrorHandler);
  return app;
}
