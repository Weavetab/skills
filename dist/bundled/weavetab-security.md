# Weavetab Domain Profile: SECURITY

Generated for @weavetab/skills v2.5.0-beta.4


## rbac-and-policies

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


## secret-containment-protocol

# Secret Containment Protocol & Zero-Bleed Execution

AI agent transcripts, LLM providers, and tool logs represent massive attack surfaces for credential leaks. Weavetab enforces a hardware-grade **Zero-Bleed Security Guarantee** for sensitive inputs.

---

## 1. Entering Credentials with `browser_type_secret`

Whenever an agent inputs passwords, two-factor backup codes, credit card numbers, or proprietary API keys, you MUST use `browser_type_secret`:

```json
{
  "ref": "w:12",
  "secret": "MySuperSecretPassword!2026",
  "clear": true
}
```

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
