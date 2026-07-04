---
id: spa-navigation
tier: general
triggers: ["spa", "single page", "react", "vue", "angular", "navigate", "route", "dynamic page"]
tools: [browser_navigate, browser_wait, browser_map, browser_snapshot, browser_click]
weavetab: ">=2.5.0"
---
# SPA Navigation Pattern

1. **Click**: Use `browser_click` to navigate within a Single Page Application (SPA).
2. **Delta Map**: Do NOT call `browser_navigate` for internal SPA links. Call `browser_map({ delta: true })` after the click to see ONLY what changed in the DOM.
3. **Wait**: If elements aren't ready, use `browser_wait` for network idle rather than arbitrary sleep timeouts.