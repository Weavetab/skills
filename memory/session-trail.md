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
  - "browser_macro_compile"
  - "browser_recording"
  - "browser_automation"
  - "browser_thoughts"
weavetab: ">=2.5.0-beta.4"
---

# Session Trails & Deterministic Macro Compilation

When an agent executes an exploratory workflow (e.g. logging into a dashboard, navigating to analytics, setting date filters, and downloading a CSV), re-running that flow autonomously in the future should not require 15 reasoning steps.

`browser_macro_compile` converts recent session actions into a high-performance, deterministic execution script.

---

## 1. Compiling Recent Actions (`browser_macro_compile`)

Extract and optimize the trail of actions taken in the active session:

```json
{
  "name": "daily_metric_export",
  "stripRedundant": true,
  "parameterizeInputs": true
}
```

### Response Example:
```json
{
  "macroId": "macro_8f7b2c",
  "name": "daily_metric_export",
  "stepsCount": 5,
  "parameters": ["startDate", "endDate"],
  "code": "// Auto-generated Weavetab Deterministic Pipeline\nawait session.navigate('https://analytics.example.com');\nawait session.click('[data-testid=\"export-btn\"]');\n..."
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

