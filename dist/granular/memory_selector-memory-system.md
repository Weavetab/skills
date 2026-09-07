---
id: selector-memory-system
domain: memory
triggers:
  - "adaptive selector"
  - "selector memory"
  - "cached selector"
  - "selector decay"
  - "cross session learning"
tools:
  - "browser_find"
  - "browser_click"
  - "browser_fill"
weavetab: ">=2.5.0-beta.3"
---

# Adaptive Selector Memory & Telemetry Engine

Repeatedly performing 50-node DOM traversals to find standard buttons ("Login", "Checkout", "Next") wastes agent turns and increases token consumption. Weavetab features an internal adaptive selector memory system that learns stable locator paths per web origin.

---

## 1. How the Memory Heuristic Operates

Every time an element is located and successfully interacted with, Weavetab calculates a confidence score based on:
1. **Attribute Stability**: Prefers `data-testid`, `id`, `aria-label`, and deterministic semantic roles over dynamic Tailwind/CSS-module class strings.
2. **Success Count**: Selectors that successfully trigger navigation or state changes gain reinforcement (+1).
3. **Origin Isolation**: Learned selectors are strictly namespaced to the origin (`https://example.com`) to prevent cross-site contamination.

---

## 2. Strike Degradation & Negative Reinforcement

Websites update frequently. If a previously learned selector fails:
- **Strike 1**: Marked as degraded. Weavetab falls back to secondary candidates (e.g. fuzzy label match).
- **Strike 2**: Deprecated. Immediate fall-back to full DOM tree inspection via `browser_find` or `browser_map`.
- **Strike 3**: Purged from memory cache to prevent stale lookups.

---

## 3. Agent Operating Discipline

1. **Rely on Native Tool Resolution**: When you pass a `ref`, Weavetab queries both the active volatile registry and the memory cache.
2. **Don't Hardcode Fragile Selectors in Prompts**: Avoid passing brittle absolute CSS paths like `div:nth-child(3) > ul > li:nth-child(2) > button`.
3. **Trust Heuristic Recovery**: If a button moves slightly on the page, the underlying engine uses the memory profile to re-anchor before reporting failure.
