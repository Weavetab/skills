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
weavetab: ">=2.5.0-beta.4"
---

# Session Trails & Deterministic Macro Compilation

When an agent executes an exploratory workflow (e.g. logging into a dashboard, navigating to analytics, setting date filters, and downloading a CSV), re-running that flow autonomously in the future should not require 15 reasoning steps.

`browser_burst` with `compile_from_history: true` automatically converts recent successful session actions into a high-performance, deterministic execution script.

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
    { "tool": "browser_go", "args": { "url": "https://analytics.example.com" } },
    { "tool": "browser_fill", "args": { "ref": "w:12", "value": "metrics" } },
    { "tool": "click_and_wait", "args": { "ref": "w:15" } }
  ],
  "message": "compiled 3 macro steps from history"
}
```

---

## 2. Parameterizing Variable Inputs

When `"parameterizeInputs": true` is passed:
- Text inputs and dates entered during the exploratory session are replaced with named parameters.
- Secrets entered via `browser_type_secret` are never hardcoded; they are replaced with environment variable or secret lookups.

---

## 3. Replaying Compiled Automations

Compiled macros can be executed in sub-second time without LLM inference overhead using `browser_automation`:

```json
{
  "macroId": "macro_8f7b2c",
  "parameters": {
    "startDate": "2026-09-01",
    "endDate": "2026-09-03"
  }
}
```

---

## 4. Emitting Operational Thoughts (`browser_thoughts`)

Log agent rationale and internal reasoning directly to the Weavetab HUD and telemetry stream without bloating user chat responses:

```json
{
  "thought": "Detected dynamic React hydration delay. Holding interaction until DOM mutation settles."
}
```

