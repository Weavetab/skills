---
id: session-trail
domain: memory
triggers:
  - "compile macro"
  - "export automation"
  - "replay actions"
  - "session trail"
  - "record workflow"
tools:
  - "browser_burst"
  - "browser_recording"
  - "browser_automation"
  - "browser_thoughts"
weavetab: ">=2.5.0"
---

# Session Trails & Deterministic Macro Compilation

When an agent executes an exploratory workflow (e.g. logging into a dashboard, navigating to analytics, setting date filters, and downloading a CSV), re-running that flow autonomously in the future should not require 15 reasoning steps.

`browser_burst` with `compile_from_history: true` converts recent successful session actions into a deterministic, replayable macro.

---

## 1. Compiling and Replaying Recent Actions (`browser_burst`)

Replay recent successful actions directly in a single turn:

```json
{
  "compile_from_history": true
}
```

Or pass `dry_run: true` to inspect the compiled macro steps before running them:

```json
{
  "compile_from_history": true,
  "dry_run": true,
  "history_limit": 15
}
```

### Response Example:
```json
{
  "success": true,
  "steps_completed": 0,
  "compiled_steps": [
    { "tool": "browser_navigate", "args": { "url": "https://analytics.example.com" } },
    { "tool": "browser_type", "args": { "ref": "w:12", "text": "metrics" } },
    { "tool": "click_and_wait", "args": { "ref": "w:15" } }
  ],
  "message": "compiled 3 macro steps from history"
}
```

Compiled steps reuse the exact arguments the original tool calls carried (for example a `browser_fill` step keeps its `fields` array). `history_limit` caps how many recent trail entries are considered (default 20).

---

## 2. What Gets Compiled

The compiler walks the session trail and keeps only successful steps whose tool is replayable (clicks, typing, navigation, keys, scroll, select, wait, fill, and similar). It:
- Drops failed steps.
- De-duplicates consecutive identical calls.
- Exposes the result as `compiled_steps` with `args` nested under each step.

Because secrets entered via `browser_type_secret` are referenced by environment-variable key (`envKey`) rather than plaintext, compiled macros never contain credentials.

---

## 3. Background Scripts (`browser_automation`)

For recurring monitoring or polling that should run without an LLM turn, `browser_automation` injects a self-running script into the page:

```json
{
  "action": "start",
  "id": "price_watch",
  "script": "setInterval(() => document.querySelector('#price')?.textContent, 5000)",
  "persistent": true,
  "onResult": "store"
}
```

- **`action`**: `start`, `stop`, `list`, or `poll`.
- **`id`**: unique script identifier (required for `start`/`stop`).
- **`script`**: the JavaScript to inject (required for `start`).
- **`persistent`**: re-run in a loop when `true`.
- **`onResult`**: `notify_agent`, `store` (default), or `ignore`.

Scripts are cleared on tab close — do not rely on them for expensive, long-running work.

---

## 4. Emitting Operational Thoughts (`browser_thoughts`)

Log agent rationale and internal reasoning directly to the Weavetab HUD and telemetry stream without bloating user chat responses:

```json
{
  "action": "feedback",
  "message": "Detected dynamic React hydration delay. Holding interaction until DOM mutation settles.",
  "style": "observation"
}
```

Use `"action": "question"` to surface a free-text question to the user (with `input` set to `sentence` or `paragraph`, and an optional `timeout`).
