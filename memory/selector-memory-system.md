---
id: selector-memory-system
domain: memory
triggers:
  - "adaptive selector"
  - "selector memory"
  - "cached selector"
  - "selector decay"
  - "cross session learning"
  - "site profile"
  - "known workflow"
  - "fast path"
tools:
  - "browser_find"
  - "browser_click"
  - "browser_fill"
  - "browser_pattern_learn"
weavetab: ">=2.5.0-beta.4"
---

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
| Knowledge hints | `~/.weavetab-system/knowledge/<hostname>.md` | Engine (auto, 20-token notes) |
| User config | `~/.weavetab/config.json` | Human — never written by agents |

