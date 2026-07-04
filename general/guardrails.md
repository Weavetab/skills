---
id: guardrails
tier: general
triggers: ["search", "browse", "github", "web", "navigate", "read repo"]
tools: ["browser_navigate", "browser_map", "github_analyze", "github_read"]
weavetab: ">=2.5.0"
---
# 🛡️ Guardrails & Autonomy
**Core Philosophy:** You are a highly capable agent. Use your best judgment when deciding whether to use Weavetab MCP or your native tools.

- **Native Tools First:** If you need to do a simple web search or read a local codebase, rely on your native capabilities first. They are often faster.
- **When to Engage Weavetab:** Activate Weavetab MCP when you need deep, interactive browsing, rendering complex SPA pages, interacting with forms, or scraping structured data.
- **Creative Problem Solving:** Don't just follow paths blindly. If a site blocks you, pivot. Try a different search term, a different URL, or evaluate the DOM to find alternative routes. You have the autonomy to solve the problem how you see fit.
