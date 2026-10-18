---
id: site-learning
domain: memory
triggers:
  - "site learning"
  - "workflow pattern"
  - "learn site"
  - "remember workflow"
  - "site memory"
  - "cookie banner quirk"
  - "fast path replay"
  - "pattern reliability"
  - "pattern compiler"
tools:
  - "browser_pattern_learn"
  - "browser_burst"
weavetab: ">=2.5.0"
---

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
