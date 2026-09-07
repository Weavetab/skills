# Weavetab Domain Profile: DEVELOPER

Generated for @weavetab/skills v2.5.0-beta.3


## github-forensics

# GitHub Forensics & Repository Architecture Inspection

Navigating GitHub repositories via web browsing burns massive token budgets loading HTML chrome, comment threads, and diff trees. Weavetab includes dedicated GitHub inspection tools that interact directly with git metadata and APIs.

---

## 1. High-Level Repository Analysis (`github_analyze`)

Quickly summarize repo structure, languages, dependency graphs, and recent commit frequency:

```json
{
  "repo": "Weavetab/MCP"
}
```

---

## 2. Reading Repository Source Files (`github_read`)

Directly stream files and directories from any public or authenticated GitHub repo without cloning:

```json
{
  "repo": "Weavetab/MCP",
  "path": "src/server.ts",
  "ref": "main"
}
```

---

## 3. Pull Request Forensics (`github_get_pr`)

Retrieve PR diffs, review comments, CI checks, and mergeability status:

```json
{
  "repo": "Weavetab/MCP",
  "prNumber": 42
}
```

---

## 4. Issue Triage & Search (`github_issues`)

Query repository issue trackers with state, label, and keyword filters:

```json
{
  "repo": "Weavetab/MCP",
  "state": "open",
  "labels": ["bug", "priority"]
}
```
