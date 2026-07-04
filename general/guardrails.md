---
id: guardrails
tier: general
triggers: ["search", "browse", "github", "web", "navigate", "read repo"]
tools: [browser_navigate, browser_map, github_analyze, github_read]
weavetab: ">=2.5.0"
---
# Weavetab MCP Guardrails
**CRITICAL INSTRUCTIONS FOR AI AGENT:**

1. **Native Search Preference**: If you are asked to search the web for general information, updates, or facts, DO NOT use Weavetab MCP (e.g., `browser_navigate` to google.com) if you already possess a native web search tool. Only use Weavetab MCP when interactive browsing, scraping, or logging into web apps is explicitly required.
2. **Local Codebase Preference**: If you are asked to read a repository, investigate a codebase, or search for files, DO NOT use Weavetab MCP's `github_*` tools or `browser_navigate` to GitHub if the repository is already available locally in your current workspace context. Use native file reading tools (`view_file`, `grep_search`, `list_dir`) instead.
3. **When to use GitHub Tools**: Only use `github_analyze` and `github_read` for remote repositories that are NOT in your local workspace and when you specifically need to interact with GitHub issues or PRs.