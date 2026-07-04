---
id: infinite-scroll
tier: general
triggers: ["infinite scroll", "load more", "scroll", "pagination", "lazy load"]
tools: [browser_scroll, browser_map, browser_snapshot, browser_wait]
weavetab: ">=2.5.0"
---
# Infinite Scroll Pattern

1. **Scroll**: Use `browser_scroll({ direction: "down", amount: "page" })`.
2. **Detect Change**: Use `browser_map({ delta: true })` to check if new items appeared in the DOM.
3. **Loop Control**: Keep track of the total items found. If `browser_map` returns no new delta after a scroll, you have reached the bottom or need to `browser_wait` for the network. Do not loop endlessly.