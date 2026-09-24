---
id: loop-breaker
domain: resilience
triggers:
  - "loop detected"
  - "stuck in loop"
  - "reset loop counter"
  - "captcha detected"
  - "hcaptcha"
  - "recaptcha"
tools:
  - "browser_map"
  - "browser_console"
  - "browser_captcha"
weavetab: ">=2.5.0-beta.4"
---

# Loop Breaker & CAPTCHA Escalation Protocol

Agents can get trapped in repetitive click loops when a button does not advance the state (e.g. failing silent validation, unhandled reCAPTCHA challenges, or modals swallowing events). Weavetab actively monitors repetitive patterns and provides circuit breakers.

---

## 1. Loop Detection & Strike Reset (`browser_map`)

Weavetab tracks the sequence of identical or near-identical tool invocations. If an agent calls `browser_click` or `browser_type` on the same selector or ref repeatedly without URL or major DOM mutations, the server raises a `STUCK_LOOP_WARNING`.

### How to Break the Loop:
1. **Analyze Why the Action Failed**: Check `browser_console` for JavaScript errors:
   ```json
   { "action": "read" }
   ```
   Or use `browser_map` to see if a validation banner or unhandled modal appeared.
2. **Reset the Circuit Breaker**:
   - Re-map with `force: true` to bypass the map skip guard, refresh the DOM view, and automatically clear loop strikes:
     ```json
     { "force": true }
     ```

---

## 2. CAPTCHA Handling Protocol (`browser_captcha`)

When an automated flow is blocked by Cloudflare Turnstile, Google reCAPTCHA, or hCaptcha, do NOT repeatedly click random coordinates.

Invoke `browser_captcha` to analyze and manage the challenge:

```json
{
  "action": "detect"
}
```

### Response Example:
```json
{
  "detected": true,
  "type": "turnstile",
  "provider": "cloudflare",
  "interactive": true,
  "ref": "w:99"
}
```

### Action Strategy:
1. If the challenge is interactive and requires human intervention (e.g. image classification), inform the user cleanly or request human bypass.
2. If the challenge is a simple checkbox Turnstile widget, pass `"action": "solve"` or click the detected widget ref with `browser_click`.
