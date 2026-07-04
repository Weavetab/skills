---
id: spa-navigation
tier: general
triggers: ["spa", "single page", "react", "vue", "angular", "navigate", "route", "dynamic page"]
tools: ["browser_navigate", "browser_wait", "browser_map", "browser_snapshot", "browser_click"]
weavetab: ">=2.5.0"
---
# 🧭 Single Page Application (SPA) Mastery
**Core Philosophy:** SPAs mutate the DOM asynchronously. You cannot rely on traditional page loads.

- **Patience is Key:** After clicking a link or a button in an SPA, the URL might change, but the network request might still be pending. Use `browser_wait` to ensure the DOM has settled.
- **Watch the DOM:** Instead of waiting blindly, look for loading spinners or skeleton screens. When they disappear, the content is ready.
- **State Awareness:** SPAs maintain state. If you get lost, you can often use the browser's back button or look for breadcrumbs to re-orient yourself.
