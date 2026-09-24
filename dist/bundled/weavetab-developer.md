# Weavetab Domain Profile: DEVELOPER

Generated for @weavetab/skills v2.5.0-beta.4


## github-forensics

# GitHub Forensics & Repository Architecture Inspection

Navigating GitHub repositories via web browsing burns massive token budgets loading HTML chrome, comment threads, and diff trees. Weavetab includes a dedicated `browser_github` tool that interacts directly with git metadata and raw endpoints.

---

## 1. High-Level Repository Analysis (action: "analyze")

Quickly summarize repo structure, languages, dependency graphs, and recent commit frequency:

```json
{
  "action": "analyze",
  "repo": "Weavetab/MCP"
}
```

---

## 2. Reading Repository Source Files (action: "read")

Directly stream files and directories from any public or authenticated GitHub repo without cloning or burning API rate limits:

```json
{
  "action": "read",
  "repo": "Weavetab/MCP",
  "paths": ["src/server.ts"],
  "line_range": [1, 200]
}
```

---

## 3. Pull Request Forensics (action: "pr")

Retrieve PR diffs, changed files, review comments, CI checks, and mergeability status:

```json
{
  "action": "pr",
  "repo": "Weavetab/MCP",
  "number": 42
}
```

---

## 4. Issue Triage & Search (action: "issues")

Query repository issue trackers with state, label, and keyword filters:

```json
{
  "action": "issues",
  "repo": "Weavetab/MCP",
  "state": "open",
  "labels": ["bug", "priority"]
}
```
