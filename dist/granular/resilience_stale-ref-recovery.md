---
id: stale-ref-recovery
domain: resilience
triggers:
  - "stale element reference"
  - "detached from dom"
  - "spa re-render"
  - "react hydration"
  - "element not found"
tools:
  - "browser_find"
  - "browser_map"
  - "browser_click"
weavetab: ">=2.5.0-beta.4"
---

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
