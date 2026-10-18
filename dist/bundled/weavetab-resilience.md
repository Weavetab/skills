# Weavetab Domain Profile: RESILIENCE

Generated for @weavetab/skills v2.5.1


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
  "success": true,
  "action": "detect",
  "captcha_detected": true,
  "captcha_type": "turnstile",
  "interaction_type": "checkbox",
  "difficulty": "easy",
  "confidence": 0.97,
  "human_needed": false,
  "message": "CAPTCHA detected: turnstile (checkbox, 97% confidence)",
  "next_action": "Call browser_captcha({ action: \"solve\" }) to attempt automated solving."
}
```

### Action Strategy:
1. If `human_needed` is `true` (e.g. image classification), inform the user cleanly or request human bypass — do not guess coordinates.
2. Otherwise pass `"action": "solve"` to attempt an automated solve (slider drag, hold, checkbox, or invisible challenges). Use `"action": "status"` to check progress and `"action": "wait_for_user"` to pause for human input.


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
  "url": "https://example.com"
}
```

Or inject an authentication cookie (one cookie per call):

```json
{
  "action": "set",
  "name": "session_token",
  "value": "xyz123",
  "domain": "example.com",
  "path": "/",
  "httpOnly": true,
  "secure": true,
  "sameSite": "Lax"
}
```

Delete a cookie by name (and optionally domain/path):

```json
{
  "action": "delete",
  "name": "session_token",
  "domain": "example.com"
}
```

Accepted fields: `name`, `value`, `domain`, `path`, `expires` (Unix seconds), `httpOnly`, `secure`, `sameSite` (`Strict`/`Lax`/`None`), and `url` (for `get`).

---

## 5. Web Storage Inspection & Injection (`browser_storage`)

Query or clear `localStorage` and `sessionStorage` keys. Choose the store with `scope`:

```json
{
  "scope": "local",
  "action": "get",
  "key": "authToken"
}
```

- **`scope`**: `"local"` or `"session"`.
- **`action`**: `get`, `set`, `remove`, `list` (all keys + values), or `clear` (the whole scope).
- **`key`** is required for `get`, `set`, and `remove`; **`value`** is required for `set`.


## stale-ref-recovery

# Stale Ref Recovery & SPA Hydration Resilience

In modern Single Page Applications (built with React, Next.js, Vue, Nuxt, Svelte), DOM nodes are frequently destroyed and recreated during client-side hydration or reactive state updates. This can invalidate a volatile `w:NN` handle between reads and actions.

---

## 1. The Multi-Tier Auto-Recovery Heuristic

When a tool receives a detached or invalidated `ref`, Weavetab attempts to re-resolve it instead of failing immediately. The recovery runs a sub-5ms heuristic over these strategies (in order) and re-stamps `data-wt-id="NN"` onto the live node:

```
  [Action on w:14 fails / handle detached]
                 │
                 ▼
  [1. Connected node + fingerprint check]
                 │ (if not found)
                 ▼
  [2. Stored CSS selector]  (data-testid, id, class)
                 │ (if not found)
                 ▼
  [3. Exact label / aria-label match]
                 │ (if not found)
                 ▼
  [4. Placeholder / name attribute match]
                 │ (if not found)
                 ▼
  [5. Fuzzy substring match]  (when label length >= 3)
```

The successful strategy is reported back to the agent (`stored_selector`, `exact_label`, `placeholder_or_name`, `fuzzy_label`). If every strategy misses, the tool returns a hard failure.

---

## 2. Agent Reactive Behavior

If an action fails because all recovery strategies were exhausted, the tool returns one of:

- `error_code: "ELEMENT_NOT_FOUND"` — the ref was in the cached map but no longer exists in the DOM.
- `error_code: "FINGERPRINT_MISMATCH"` — an element exists but its tag/role fingerprint no longer matches; the DOM was likely rebuilt.

Either way:

1. **Do NOT Repeat the Identical Call**: retrying the exact same stale `ref` (`w:14`) will fail again.
2. **Execute a Fast Targeted Lookup**: run `browser_find` with the text of the button or input, or refresh handles with `browser_map`.
3. **Execute the Action on the New Handle**: use the updated ref returned by `browser_find`/`browser_map`.
