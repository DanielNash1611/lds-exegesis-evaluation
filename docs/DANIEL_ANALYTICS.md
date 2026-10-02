# Daniel Analytics

Hosted Vercel MCP requests record fixed tool outcome names only. Each HTTP request creates fresh random identifiers; reports measure requests, never people or browser retention. Evaluation start/completion means the deterministic evaluation contract was requested/returned, not that an LLM evaluation was produced or validated.

No passages, religious interests, tool arguments, results, account identifiers, cookies or IPs are read by the recorder. Payload properties are empty. Do Not Track and Sec-GPC request headers opt out; DANIEL_ANALYTICS_DISABLED=true disables the deployment. Local HTTP and stdio runs send nothing. Preview events remain separate from production. Transport errors are swallowed and never disclose driver or input data.
