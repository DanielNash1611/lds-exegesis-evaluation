import { createExegesisHttpApp } from "./http-app.js";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "127.0.0.1";

const app = createExegesisHttpApp({ host });

const httpServer = app.listen(port, host, () => {
  console.log(`LDS Exegesis MCP server listening at http://${host}:${port}/mcp`);
});

process.on("SIGINT", () => {
  httpServer.close(() => process.exit(0));
});
