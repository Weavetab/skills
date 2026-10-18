---
id: rbac-and-policies
domain: security
triggers:
  - "rbac"
  - "security policy"
  - "role boundaries"
  - "viewer agent"
  - "permission denied"
tools:
  - "browser_inspect"
  - "browser_scrape"
  - "browser_map"
weavetab: ">=2.5.0"
---

# Role-Based Access Control (RBAC) & Agent Guardrails

Weavetab allows developers to run untrusted or lower-privilege subagents within strict security boundaries to prevent accidental destructive operations or data leaks.

Roles are configured per agent (in `config.json`). The server checks the role **before** launching a browser or resolving the target.

---

## 1. The 5 Security Roles

| Role | Tool Access | Intended Use |
| :--- | :--- | :--- |
| `admin` | Full access (`*`). | Primary operator / lead agent. |
| `operator` | Full access (`*`). | Standard automation agent. |
| `automation` | Every tool except `browser_thoughts` — automation agents must be non-interactive. | Background cron / worker. |
| `viewer` | Read-only set only: `browser_map`, `browser_find`, `browser_scrape`, `browser_console`, `browser_eval`, `browser_inspect`, `browser_extract_design`, `browser_snapshot`, `browser_screenshot`, `browser_pdf`, `browser_cookies`, `browser_tabs`, `browser_wait`, `browser_pattern_learn`. | Research subagents / scrapers. |
| `system` | `browser_thoughts`, `browser_detect`, `browser_performance`, `browser_checkpoint`, `browser_pattern_learn`. | Internal/system operations. |

Any other role value is treated as fully allowed.

---

## 2. Handling Permission Denials

There is no JSON `error_code` for RBAC. A denied call fails with `isError: true` and a plain-text message prefixed with `[!]`:

```
[!] Role 'viewer' does not have permission to use 'browser_click'. Viewer role only permits read-only tools (map/find/scrape/console/eval/inspect/snapshot/pdf/cookies).
```

### Protocol:
1. Do not retry the denied tool — the role will not change mid-session.
2. Delegate the interactive action to the parent agent or a higher-privilege operator.
3. Limit your output to findings gathered via read-only tools (`browser_scrape`, `browser_map`, `browser_inspect`).
