# Weavetab Domain Profile: SECURITY

Generated for @weavetab/skills v2.5.1


## rbac-and-policies

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


## secret-containment-protocol

# Secret Containment Protocol & Zero-Bleed Execution

AI agent transcripts, LLM providers, and tool logs represent massive attack surfaces for credential leaks. Weavetab enforces a hardware-grade **Zero-Bleed Security Guarantee** for sensitive inputs.

---

## 1. Entering Credentials with `browser_type_secret`

Whenever an agent inputs passwords, two-factor backup codes, credit card numbers, or proprietary API keys, you MUST use `browser_type_secret`.

`browser_type_secret` never accepts a plaintext secret. It reads the value from an **environment variable** on the host running the MCP server, so the secret never reaches the agent transcript. Set the variable first (e.g. `export PORTAL_PASSWORD="…"`), then reference it by key:

```json
{
  "ref": "w:12",
  "envKey": "PORTAL_PASSWORD"
}
```

Accepted targeting parameters: `id` (alias `ref`) or `target` (CSS selector). `envKey` is **required**.

---

## 2. The Zero-Bleed Guarantee Architecture

When `browser_type_secret` is invoked:
1. **CDP Interception**: The secret is typed via masked CDP synthetic key events.
2. **HUD Redaction**: The browser Heads-Up Display (HUD) and visual overlay strictly renders bullets (`••••••••`).
3. **Log Sanitization**: Console logs, MCP server logs, and JSON return values strip the secret string and return:
   ```json
   {
     "success": true,
     "message": "Secret typed successfully into ref 'w:12' (length: 26). Value redacted."
   }
   ```
4. **No Re-Emission**: Never print or echo raw credentials into subsequent model thoughts or conversation messages.

---

## 3. Strict Operating Prohibition

> [!CAUTION]
> Under NO circumstances should an agent pass passwords or credentials to:
> - `browser_type`
> - `browser_fill`
> - `browser_eval`
> 
> Doing so causes plaintext secrets to enter unmasked transcripts and tool logs.
