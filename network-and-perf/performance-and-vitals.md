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
weavetab: ">=2.5.0-beta.4"
---

# Performance Forensics & Core Web Vitals

Optimizing agent execution and auditing client performance requires objective metrics rather than arbitrary sleep timers.

---

## 1. Core Web Vitals Auditing (`browser_performance`)

Retrieve Google Core Web Vitals, memory consumption, and frame rendering bottlenecks directly from the Chromium engine:

```json
{
  "metrics": ["vitals", "memory", "navigationTiming"]
}
```

### Response Example:
```json
{
  "vitals": {
    "fcp": 320,
    "lcp": 780,
    "cls": 0.012,
    "fid": 8,
    "inp": 45
  },
  "memory": {
    "jsHeapUsedSizeMb": 42.1,
    "jsHeapTotalSizeMb": 68.4
  }
}
```

---

## 2. Deterministic Synchronization (`browser_wait`)

> [!WARNING]
> NEVER call arbitrary fixed sleep timers (e.g. `sleep 5000`). Fixed sleeps waste user time and still fail when network latency spikes.

Always synchronize with deterministic browser conditions:

### Wait for Network Idle:
```json
{
  "condition": "network_idle",
  "timeout": 10000
}
```

### Wait for DOM Mutation Stability:
```json
{
  "condition": "dom_stable",
  "duration": 500,
  "timeout": 10000
}
```

### Wait for a Specific Element to Appear:
```json
{
  "condition": "element_visible",
  "selector": "[data-testid=\"checkout-complete\"]",
  "timeout": 15000
}
```
