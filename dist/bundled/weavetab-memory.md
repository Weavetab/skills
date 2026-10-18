# Weavetab Domain Profile: MEMORY

Generated for @weavetab/skills v2.5.1


## selector-memory-system

# Two-Tier Memory System

Weavetab operates a two-tier persistent memory system. Understanding both layers prevents wasted DOM traversals and makes agents dramatically faster across sessions.

---

## Tier 1 — Selector Confidence Cache (`~/.weavetab-system/memory/`)

Per-domain JSON files (one per hostname) track individual element selectors and their interaction history.

Every time an element is located and interacted with, Weavetab calculates a confidence score based on:
1. **Attribute Stability**: Prefers `data-testid`, `id`, `aria-label`, and semantic roles over dynamic Tailwind/CSS-module class strings.
2. **Success Count**: Selectors that successfully trigger navigation or state changes gain reinforcement.
3. **Origin Isolation**: Learned selectors are strictly namespaced to the origin to prevent cross-site contamination.

### Strike Degradation
- **Strike 1**: Marked as degraded — falls back to secondary candidates or fuzzy label match.
- **Strike 2**: Deprecated — immediate fallback to full DOM inspection via `browser_find` or `browser_map`.
- **Strike 3**: Purged from memory cache to prevent stale lookups.

### Agent Discipline for Tier 1
1. **Rely on Native Tool Resolution**: When you pass a `ref`, Weavetab queries both the active volatile registry and the Tier 1 memory cache automatically.
2. **Don't Hardcode Fragile Selectors**: Never pass brittle absolute CSS paths like `div:nth-child(3) > ul > li:nth-child(2) > button`.
3. **Trust Heuristic Recovery**: If a button moves slightly on the page, the underlying engine re-anchors before reporting failure.

---

## Tier 2 — Site Profiles & Workflow Patterns (`~/.weavetab-system/memory/sites/`)

One JSON file per origin stores named multi-step workflow patterns, site quirks, and reliability scores. This is the **Intelligent Memory** layer — agents learn entire flows, not just individual selectors.

### Checking a Site Profile at Session Start
Always call `browser_pattern_learn` with `action: "get"` when starting an automation session on a site you may have visited before:

```json
{ "origin": "https://github.com" }
```

Response tells you:
- `known_patterns`: named flows with reliability scores and step counts
- `quirks`: known cookie banners, rate limits, modal popups to handle automatically
- `framework`: detected frontend stack
- `_hint`: compact hint string summarizing everything

### Fast-Path Decision Rule
| Reliability | Action |
|---|---|
| **≥ 0.8** | Use pattern steps directly via `browser_burst` — skip exploratory navigation |
| **0.5 – 0.79** | Attempt pattern but verify success indicator before moving on |
| **< 0.5 or strikes ≥ 3** | Ignore pattern, re-explore from scratch, then teach via `browser_pattern_learn` |

### Teaching a New Pattern After Completing a Workflow
After successfully completing a multi-step flow:

```json
{
  "origin": "https://github.com",
  "action": "learn",
  "name": "login_flow",
  "steps": [
    { "tool": "browser_click", "target": ".btn-login" },
    { "tool": "browser_fill", "target": "#login_field", "value": "{{username}}" },
    { "tool": "browser_fill", "target": "#password", "value": "{{password}}" },
    { "tool": "browser_click", "target": "[type=submit]" }
  ],
  "success_indicator": "a[aria-label='Homepage']"
}
```

### Recording Execution Outcomes (Reliability Upkeep)
After replaying a pattern, always report the outcome:

```json
{
  "origin": "https://github.com",
  "action": "record_execution",
  "name": "login_flow",
  "success": true,
  "duration_ms": 3200
}
```

### Recording Site Quirks
When you discover a cookie banner or rate limit:

```json
{
  "origin": "https://github.com",
  "action": "record_quirk",
  "quirk_key": "cookie_banner",
  "quirk_data": { "selector": "#cookie-consent", "action": "click .accept-all", "appears": "first_visit" }
}
```

On future visits, the quirk is present in the profile so you can dismiss banners before starting your main workflow — zero wasted agent turns.

---

## File Locations (Never Write to ~/.weavetab/)

| Tier | Path | Owner |
|---|---|---|
| Tier 1 selectors | `~/.weavetab-system/memory/<hostname>.json` | Engine (auto) |
| Tier 2 site profiles | `~/.weavetab-system/memory/sites/<origin>.json` | Engine via `browser_pattern_learn` |
| Knowledge hints | `~/.weavetab/knowledge/<hostname>.md` | Engine (auto, 20-token notes) |
| User config | `~/.weavetab/config.json` | Human — never written by agents |


## session-trail

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


## site-learning

# Site Learning — Autonomous Workflow Memory

Weavetab's Site Learning engine accumulates cross-session knowledge about websites and multi-step automation flows. Each site gets one profile file at `~/.weavetab-system/memory/sites/<origin>.json` — never duplicated, always merged on write.

A profile holds `framework`, `captcha_frequency`, `quirks`, and named `patterns` (each with `steps`, `reliability`, `strikes`, and execution counters).

---

## 1. Session Start Protocol

On every session visiting a known or potentially-known site, run:

```json
{ "action": "get", "origin": "https://github.com" }
```

`action` defaults to `"learn"`, so `get` must be stated explicitly. If `origin` is omitted, `get` reads the active tab's origin.

Parse the response:
- `known: false` → the site is new; proceed exploratorily and teach it after completion.
- `_hint` → a compact text summary listing `framework`, `captcha_frequency`, `known_patterns` (with reliability and step counts), and `quirks`.
- `quirks` → auto-handle any listed quirks (cookie banners, rate limits) before the main task.

---

## 2. Fast-Path vs. Exploratory Decision

Use the per-pattern `reliability` (and `strikes`) values to choose your strategy:

| Reliability | Strikes | Strategy |
|---|---|---|
| ≥ 0.8, strikes = 0 | — | **Fast path**: replay the stored steps via `browser_burst` directly |
| 0.5–0.79 | 0–1 | **Cautious path**: replay steps, verify `success_indicator` after each critical step |
| < 0.5 | any | **Re-explore**: navigate manually, collect correct steps, then teach |
| any | ≥ 3 | **Re-learn**: ignore the cached pattern, re-explore, then `learn` again with updated steps |

The `_hint` string flags eligible patterns with `[fast-path eligible]` and stale ones with `[RE-LEARN NEEDED]`.

---

## 3. Quirk Auto-Handling

If a profile lists quirks, resolve them immediately after navigation before executing your main task. Example stored quirk data:

```
{ "cookie_banner": { "selector": "#cookie-consent", "action": "click .accept-all", "appears": "first_visit" } }
```

Execute the action before doing anything else. Never spend reasoning turns on a known dismissible popup.

---

## 4. Teaching a Workflow Pattern

After successfully completing a multi-step flow for the first time (or after re-learning):

```json
{
  "action": "learn",
  "origin": "https://github.com",
  "name": "login_flow",
  "steps": [
    { "tool": "browser_navigate", "target": "https://github.com/login" },
    { "tool": "browser_fill", "target": "#login_field", "value": "{{username}}" },
    { "tool": "browser_fill", "target": "#password", "value": "{{password}}" },
    { "tool": "browser_click", "target": "[type=submit]" }
  ],
  "success_indicator": "a[aria-label='Homepage']",
  "entry": "/login"
}
```

Each step accepts `tool`, an optional `target` (selector or URL), an optional `value`, and an optional `extra` object forwarded verbatim to `browser_burst` replay.

**Pattern Naming Rules**:
- Use snake_case.
- Be descriptive: `login_flow`, `pr_review`, `csv_export`, `checkout_flow`.
- A duplicate name on the same origin is an **update** (merge) — it never creates a second pattern.

**Step Quality Rules**:
- Prefer semantic selectors: `data-testid`, `id`, `aria-label`, readable text-based selectors.
- Avoid hashed classes (`.hash_abc123`), positional selectors (`div:nth-child(4)`), and deep anonymous chains (`div > div > div > span`) — the engine drops volatile selectors during compilation.
- For sensitive inputs, record a placeholder like `{{username}}` — never hardcode credentials.

---

## 5. Reliability Upkeep After Replay

Every time you replay a pattern, report the outcome:

```json
{
  "action": "record_execution",
  "origin": "https://github.com",
  "name": "login_flow",
  "success": true,
  "duration_ms": 3100
}
```

`success` is required. The engine updates reliability via EWMA (α=0.15):
- A success nudges reliability toward 1.0 (and resets `strikes` to 0).
- A failure lowers reliability and increments `strikes`; 3 consecutive failures trigger a re-learn flag.

If no pattern with that name exists for the origin, the call returns `error_code: "PATTERN_NOT_FOUND"`.

---

## 6. Recording a New Quirk

When you encounter a cookie consent modal, popup, or rate limit for the first time:

```json
{
  "action": "record_quirk",
  "origin": "https://example.com",
  "quirk_key": "cookie_banner",
  "quirk_data": {
    "selector": "#cookie-consent",
    "action": "click .accept-all",
    "appears": "first_visit"
  }
}
```

Supported `quirk_key` values: `cookie_banner`, `rate_limit`, `modal_popups`.

For rate limits:

```json
{
  "action": "record_quirk",
  "origin": "https://example.com",
  "quirk_key": "rate_limit",
  "quirk_data": { "threshold": "60req/min", "recovery": "wait 30s" }
}
```

---

## 7. Anti-Patterns to Avoid

- **Never create per-session pattern names** like `login_2026_09_16` — one name per workflow per origin, forever updated in place.
- **Never call `browser_pattern_learn` in a loop** — one call per workflow completion. The write is idempotent (skips the disk write if nothing changed).
- **Never store credentials in steps** — use placeholders or `browser_type_secret` during actual execution.
- **Never write to `~/.weavetab/`** — all memory belongs in `~/.weavetab-system/memory/sites/`.

---

## 8. Full Session Example: GitHub PR Review

```
1. browser_pattern_learn { action: "get", origin: "https://github.com" }
   → known_patterns: pr_review (reliability 0.95, 3 steps) [fast-path eligible]
   → quirks: none

2. Since reliability = 0.95 (≥ 0.8): use the fast path.
   browser_burst with the 3 stored steps.

3. After completion:
   browser_pattern_learn {
     action: "record_execution",
     name: "pr_review",
     origin: "https://github.com",
     success: true,
     duration_ms: 2800
   }
```

Total agent turns for a known site: **3 tool calls** vs. potentially 12+ with full exploration.
