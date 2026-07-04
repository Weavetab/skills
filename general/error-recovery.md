---
id: error-recovery
tier: general
triggers: ["error", "fail", "timeout", "crash", "not found", "stuck", "fix"]
tools: ["browser_snapshot", "browser_map", "browser_console", "browser_wait"]
weavetab: ">=2.5.0"
---
# 🚑 Autonomous Error Recovery
**Core Philosophy:** Errors are inevitable. Your strength is in how you recover from them.

- **Don't Panic:** If a tool call fails (e.g., element not found, timeout), do not immediately give up and ask the user. 
- **Investigate:** Take a `browser_snapshot` to see what the page actually looks like. Check the `browser_console` for JavaScript errors that might explain why the page is broken.
- **Pivot and Retry:** Did the page layout change? Find the new selector. Did a modal pop up and steal focus? Close it. You have the autonomy to troubleshoot and try alternative approaches before admitting defeat.
