import { createExegesisHttpApp } from "../src/mcp/http-app.js";

// Vercel terminates HTTPS and supplies the public Host header at the edge.
export default createExegesisHttpApp({ host: "0.0.0.0" });
