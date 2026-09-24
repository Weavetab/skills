# Weavetab Domain Profile: RESILIENCE

Generated for @weavetab/skills v2.5.0-beta.4


## loop-breaker

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


## session-time-travel

# Session Time-Travel & Instant State Rollback

In complex multi-step workflows (e.g. checkout funnels, multi-page configuration wizards, onboarding questionnaires), an error at Step 7 traditionally forces an agent to reload the root URL, re-authenticate, and waste 10+ turns repeating steps.

`browser_checkpoint` enables instantaneous time-travel by snapshotting and restoring complete browser session state.

---

## 1. What a Checkpoint Captures

A single named checkpoint atomically preserves:
- **Cookies**: Full domain cookies including `HttpOnly`, `Secure`, and `SameSite` flags.
- **Web Storage**: Entire `localStorage` and `sessionStorage` key-value maps.
- **Navigation State**: Exact page URL, scroll positions (`x`, `y`), and page title.

---

## 2. Checkpoint Operations

### A. Saving a Checkpoint (`save`)
Create a checkpoint right before undertaking risky, branching, or destructive actions:

```json
{
  "action": "save",
  "name": "pre_checkout_authenticated"
}
```

### B. Restoring a Checkpoint (`restore`)
If a downstream step errors out, times out, or hits an invalid state, roll back immediately:

```json
{
  "action": "restore",
  "name": "pre_checkout_authenticated"
}
```
*Latency: ~15ms*. The page navigates back to the checkpoint URL with cookies and storage atomically injected.

### C. Listing Checkpoints (`list`)
Inspect all active checkpoints for the current page target:

```json
{
  "action": "list"
}
```

### D. Cleaning Up (`delete`)
Free memory once a workflow has concluded:

```json
{
  "action": "delete",
  "name": "pre_checkout_authenticated"
}
```

---

## 3. High-Leverage Agent Pattern

```
1. Authenticate to Target Portal
2. browser_checkpoint({ action: "save", name: "auth_ready" })
3. Attempt automated action sequence (e.g. form filling or testing)
4. IF error occurs:
     browser_checkpoint({ action: "restore", name: "auth_ready" })
     -> Agent is immediately back at authenticated state without re-login!
```

---

## 4. Fine-Grained Cookie Management (`browser_cookies`)

Inspect, set, or delete individual browser session cookies without restoring an entire checkpoint:

```json
{
  "action": "get",
  "urls": ["https://example.com"]
}
```

Or inject an authentication cookie:
```json
{
  "action": "set",
  "cookies": [
    {
      "name": "session_token",
      "value": "xyz123",
      "domain": "example.com",
      "httpOnly": true,
      "secure": true
    }
  ]
}
```

---

## 5. Web Storage Inspection & Injection (`browser_storage`)

Query or clear `localStorage` and `sessionStorage` keys:

```json
{
  "storageType": "localStorage",
  "action": "get",
  "key": "authToken"
}
```


## stale-ref-recovery

# Stale Ref Recovery & SPA Hydration Resilience

In modern Single Page Applications (built with React, Next.js, Vue, Nuxt, Svelte), DOM nodes are frequently destroyed and recreated during client-side hydration or reactive state updates. This often causes `STALE_ELEMENT_REFERENCE` or `NODE_DETACHED` errors when an agent attempts an action.

---

## 1. The 4-Tier Auto-Recovery Chain

When a tool receives a stale or missing `ref`, Weavetab does not immediately fail. It activates an internal 4-tier recovery chain:

```
  [Action on w:14 Fails / Stale]
                │
                ▼
  [Tier 1: Stored Selector] ──▶ Re-queries cached stable selector (data-testid, id)
                │ (if not found)
                ▼
  [Tier 2: Exact Label Match] ──▶ Queries element with identical visible text & tag
                │ (if not found)
                ▼
  [Tier 3: Semantic Role Match] ──▶ Queries nearest sibling with matching ARIA role
                │ (if not found)
                ▼
  [Tier 4: Fuzzy Match] ──▶ Re-anchors to highest-confidence visual candidate
```

If the recovery chain succeeds, the action executes seamlessly and the return payload notifies the agent that the handle was refreshed.

---

## 2. Agent Reactive Behavior

If an action returns `ERROR: STALE_ELEMENT_REFERENCE` because all 4 recovery tiers were exhausted:

1. **Do NOT Repeat the Identical Call**: Retrying the exact same stale `ref` (`w:14`) will fail again.
2. **Execute a Fast Targeted Lookup**: Run `browser_find` with the text of the button or input field.
3. **Execute the Action on the New Handle**: Use the updated handle returned by `browser_find`.
