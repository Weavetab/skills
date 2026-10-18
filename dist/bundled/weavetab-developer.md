# Weavetab Domain Profile: DEVELOPER

Generated for @weavetab/skills v2.5.1


## github-forensics

# GitHub Forensics & Repository Architecture Inspection

Navigating GitHub repositories via web browsing burns massive token budgets loading HTML chrome, comment threads, and diff trees. The official `@weavetab/plugin-github` plugin provides a dedicated `github` tool that talks to the GitHub REST API and raw content endpoints directly — no browser DOM, no cloning.

Responses are cached on disk (`~/.weavetab-system/github_cache`) and subject to GitHub's API rate limits.

---

## 1. High-Level Repository Analysis (action: "analyze")

Fetches repo metadata, the default branch, a flat recursive file tree, and a README snippet (first 100 lines). Results are cached and reused by `read`:

```json
{
  "action": "analyze",
  "repo": "Weavetab/MCP"
}
```

Returns fields such as `owner`, `repo`, `default_branch`, `description`, `language`, `file_tree` (array of `{path, type, size, sha}`), and `readme_snippet`.

If `repo` is omitted, the active tab's repository is used.

---

## 2. Reading Repository Source Files (action: "read")

Stream specific files from a public or authenticated repo via `raw.githubusercontent.com`. Requires a prior `analyze` (to cache the default branch and tree), or it will run one automatically:

```json
{
  "action": "read",
  "repo": "Weavetab/MCP",
  "paths": ["src/server.ts"],
  "line_range": [1, 200]
}
```

`paths` is relative to the repo root; `line_range` is an optional `[start, end]` (1-indexed).

---

## 3. Pull Request Forensics (action: "pr")

Retrieve PR details, changed files, and review comments:

```json
{
  "action": "pr",
  "repo": "Weavetab/MCP",
  "number": 42
}
```

Passing `number` fetches that PR; omitting it lists recent PRs.

---

## 4. Issue Triage & Search (action: "issues")

Query the issue tracker with state, label, keyword, and limit filters:

```json
{
  "action": "issues",
  "repo": "Weavetab/MCP",
  "state": "open",
  "labels": ["bug"],
  "limit": 5
}
```

- **`number`** fetches a single issue plus its comments.
- **`search`** runs a keyword search across issues.
- **`state`** (`open`/`closed`/`all`) and **`labels`** filter the listing; `limit` caps results (default 5).

> The GitHub **search** API is rate-limited more aggressively than raw/GET reads. `read` and `analyze` file fetches do not consume search-quota calls. If a call fails with a rate-limit message, wait until the reported reset time before retrying.
