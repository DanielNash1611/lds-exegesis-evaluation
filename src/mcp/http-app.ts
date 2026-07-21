import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Request, Response } from "express";
import { createExegesisMcpServer } from "./server.js";

type HttpAppOptions = {
  host?: string;
};

export function createExegesisHttpApp(options: HttpAppOptions = {}) {
  const app = createMcpExpressApp({ host: options.host ?? "127.0.0.1" });

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
    const server = createExegesisMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined
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

  return app;
}
