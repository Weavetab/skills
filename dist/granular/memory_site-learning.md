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
weavetab: ">=2.5.0-beta.4"
---

# Site Learning — Autonomous Workflow Memory

Weavetab's Site Learning engine accumulates cross-session knowledge about websites and multi-step automation flows. Each site gets one profile file at ~/.weavetab-system/memory/sites/<origin>.json — never duplicated, always merged on write.

---

## 1. Session Start Protocol

On every session visiting a known or potentially-known site, run:

`json
{ "tool": "browser_pattern_learn", "action": "get", "origin": "https://github.com" }
`

Parse the response:
- known: false → site is new, proceed exploratorily, teach after completion
- known_patterns → list of named workflows with reliability scores
- quirks → auto-handle any listed quirks (cookie banners, rate limits) before main task
- ramework → adjust interaction strategy accordingly (React, Vue, etc.)

---

## 2. Fast-Path vs. Exploratory Decision

Use the _hint field or individual eliability values to decide your strategy:

| Reliability | Strikes | Strategy |
|---|---|---|
| ≥ 0.8, strikes = 0 | ✓ | **Fast path**: replay steps via rowser_burst directly |
| 0.5–0.79 | 0–1 | **Cautious path**: replay steps, verify success_indicator after each critical step |
| < 0.5 | any | **Re-explore**: navigate manually, collect correct steps, then teach |
| any | ≥ 3 | **Re-learn**: ignore cached pattern, re-explore, then call rowser_pattern_learn with updated steps |

---

## 3. Quirk Auto-Handling

If a profile has known quirks, resolve them immediately after navigation before executing your main task:

`
Profile quirks: { cookie_banner: { selector: "#cookie-consent", action: "click .accept-all", appears: "first_visit" } }
`

Execute the action before doing anything else. Never spend reasoning turns on a known dismissible popup.

---

## 4. Teaching a Workflow Pattern

After successfully completing a multi-step flow for the first time (or after re-learning):

`json
{
  "tool": "browser_pattern_learn",
  "origin": "https://github.com",
  "action": "learn",
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
`

**Pattern Naming Rules**:
- Use snake_case
- Be descriptive: login_flow, pr_review, csv_export, checkout_flow
- Duplicate name on same origin = **update** (merge), never creates a second pattern

**Step Quality Rules**:
- Use semantic selectors: data-testid, id, ria-label, readable text-based selectors
- Avoid: .hash_abc123, div:nth-child(4), deep anonymous chains like div > div > div > span
  (the engine automatically drops volatile selectors during compilation)
- For sensitive inputs, record the step with a placeholder like {{username}} — never hardcode credentials

---

## 5. Reliability Upkeep After Replay

Every time you replay a pattern, report the outcome:

`json
{
  "tool": "browser_pattern_learn",
  "origin": "https://github.com",
  "action": "record_execution",
  "name": "login_flow",
  "success": true,
  "duration_ms": 3100
}
`

The engine uses EWMA (α=0.15) to update the reliability score:
- Success run → reliability climbs toward 1.0 slowly
- Failure run → reliability drops; 3 consecutive failures trigger [RE-LEARN NEEDED] flag

---

## 6. Recording a New Quirk

When you encounter a cookie consent modal, popup, or rate limit for the first time:

`json
{
  "tool": "browser_pattern_learn",
  "origin": "https://example.com",
  "action": "record_quirk",
  "quirk_key": "cookie_banner",
  "quirk_data": {
    "selector": "#cookie-consent",
    "action": "click .accept-all",
    "appears": "first_visit"
  }
}
`

Supported quirk_key values: cookie_banner, ate_limit, modal_popups

For rate limits:
`json
{
  "quirk_key": "rate_limit",
  "quirk_data": { "threshold": "60req/min", "recovery": "wait 30s" }
}
`

---

## 7. Anti-Patterns to Avoid

- **Never create per-session pattern names** like login_2026_09_16 — one name per workflow per origin, forever updated in place.
- **Never call rowser_pattern_learn in a loop** — one call per workflow completion. The write is idempotent (skips disk write if nothing changed).
- **Never store credentials in steps** — use placeholders or rowser_type_secret in actual execution.
- **Never write to ~/.weavetab/** — all memory belongs in ~/.weavetab-system/memory/sites/.

---

## 8. Full Session Example: GitHub PR Review

`
1. browser_pattern_learn { action: "get", origin: "https://github.com" }
   → patterns: { pr_review: { reliability: 0.95, steps: 3 } }
   → quirks: {} (none)

2. Since reliability=0.95 (≥ 0.8): use fast path
   browser_burst with the 3 stored steps

3. After completion:
   browser_pattern_learn {
     action: "record_execution",
     name: "pr_review",
     success: true,
     duration_ms: 2800
   }
`

Total agent turns for a known site: **3 tool calls** vs. potentially 12+ with full exploration.
