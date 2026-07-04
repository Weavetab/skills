---
id: infinite-scroll
tier: general
triggers: ["infinite scroll", "load more", "scroll", "pagination", "lazy load"]
tools: ["browser_scroll", "browser_map", "browser_snapshot", "browser_wait"]
weavetab: ">=2.5.0"
---
# 📜 Infinite Scroll Navigation
**Core Philosophy:** Some data is hidden behind the scrollbar. You must be proactive in revealing it.

- **Scroll and Observe:** Use `browser_scroll` to move down the page. Don't just scroll once—if you're looking for a specific item, loop your scroll and `browser_wait` until the network fetches the new items.
- **Know When to Stop:** Monitor the DOM. If you scroll and the total height of the page doesn't change after a few seconds, you've likely hit the bottom.
- **Load More Buttons:** Infinite scroll is sometimes replaced by "Load More" buttons. Be vigilant—if scrolling isn't working, look for a button to click instead.
