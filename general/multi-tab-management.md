---
id: multi-tab-management
tier: general
triggers: []
tools: []
weavetab: ">=2.5.0"
---
# Multi-Tab Management Pattern

1. **List Tabs**: Call `browser_tabs()` to get a list of all open tabs and their `tab_id`s.
2. **Switch Context**: Most Weavetab MCP tools (like `browser_map`, `browser_click`) accept a `tab_id` parameter. Pass the specific `tab_id` to execute actions in a background tab without needing to bring it to the foreground.
3. **Handle Popups**: If clicking a link opens a new tab, run `browser_tabs()` to identify the new tab, then target it with `tab_id`. Do NOT assume the new tab automatically becomes the active target unless specified.
4. **Cleanup**: Close tabs when no longer needed using `browser_tabs({ action: "close", tab_id: "..." })` to preserve memory and token context.