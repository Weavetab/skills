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
weavetab: ">=2.5.0"
---

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
