---
id: performance-and-vitals
domain: network-and-perf
triggers:
  - "measure performance"
  - "core web vitals"
  - "lcp"
  - "cls"
  - "fcp"
  - "wait condition"
  - "page slow"
tools:
  - "browser_performance"
  - "browser_wait"
weavetab: ">=2.5.0"
---

# Performance Forensics & Core Web Vitals

Optimizing agent execution and auditing client performance requires objective metrics rather than arbitrary sleep timers.

---

## 1. Core Web Vitals Auditing (`browser_performance`)

Retrieve Google Core Web Vitals, memory consumption, and frame rendering bottlenecks directly from the Chromium engine:

```json
{
  "metrics": ["vitals", "memory", "navigation"]
}
```

### Response Example:
```json
{
  "vitals": {
    "fcp": 320,
    "lcp": 780,
    "cls": 0.012,
    "inp": 45,
    "ttfb": 12
  },
  "memory": {
    "usedJSHeapSize": 44154880,
    "totalJSHeapSize": 71729152,
    "jsHeapSizeLimit": 4294705152
  }
}
```

Valid `metrics` sections: `"vitals"`, `"memory"`, `"navigation"`, `"resources"`, `"raw"`. Omit `metrics` to return all sections. Heap sizes are in **bytes**. The `"resources"` section populates `slowest_resources` (top 10 by duration).

---

## 2. Deterministic Synchronization (`browser_wait`)

> [!WARNING]
> NEVER call arbitrary fixed sleep timers (e.g. `sleep 5000`). Fixed sleeps waste user time and still fail when network latency spikes.

Always synchronize with deterministic browser conditions:

### Wait for Network Idle:
```json
{
  "for": "network",
  "timeout": 10000
}
```

### Wait for DOM Mutation Stability:
```json
{
  "for": "stable",
  "timeout": 10000
}
```

### Wait for a Specific Element to Appear:
```json
{
  "for": "element",
  "value": "[data-testid=\"checkout-complete\"]",
  "timeout": 15000
}
```
