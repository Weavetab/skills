---
id: secret-containment-protocol
domain: security
triggers:
  - "enter password"
  - "input credentials"
  - "api key entry"
  - "sensitive token"
  - "secret containment"
tools:
  - "browser_type_secret"
weavetab: ">=2.5.0-beta.4"
---

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
