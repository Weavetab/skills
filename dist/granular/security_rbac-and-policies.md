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
weavetab: ">=2.5.0-beta.3"
---

# Role-Based Access Control (RBAC) & Agent Guardrails

Weavetab allows developers to run untrusted or lower-privilege subagents within strict security boundaries to prevent accidental destructive operations or data leaks.

---

## 1. The 4 Security Tiers

| Tier | Name | Allowed Tools & Capabilities | Intended Role |
| :--- | :--- | :--- | :--- |
| **0** | `admin` | Full tool access (all 48 tools), plugin loading, arbitrary script eval, cookies/storage write. | Primary Operator / Lead Agent. |
| **1** | `operator` | Interactive tools (`browser_click`, `browser_fill`, `browser_upload`), but blocked from loading untrusted plugins. | Standard Automation Agent. |
| **2** | `automation` | Pre-approved deterministic macros (`browser_automation`), scoped form filling, no arbitrary script execution. | Background Cron / Worker. |
| **3** | `viewer` | Read-only inspection tools (`browser_map`, `browser_find`, `browser_scrape`, `browser_inspect`). All click, type, and storage tools are rejected with `PERMISSION_DENIED`. | Research Subagents / Scrapers. |

---

## 2. Handling `PERMISSION_DENIED` Errors

If an agent attempts an action outside its allocated role tier:
```json
{
  "error_code": "PERMISSION_DENIED",
  "message": "Tool 'browser_click' is disabled under role 'viewer'. Only read operations are permitted."
}
```

### Protocol:
1. Do not retry the denied tool.
2. Delegate the interactive action to the parent agent or primary operator.
3. Limit your output to findings gathered via read-only tools (`browser_scrape`, `browser_map`, `browser_inspect`).
