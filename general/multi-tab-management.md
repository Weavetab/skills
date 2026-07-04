---
id: multi-tab-management
tier: general
triggers: ["new tab", "open tab", "switch tab", "multiple tabs", "popup", "window"]
tools: ["browser_tabs", "browser_navigate", "browser_click", "browser_map"]
weavetab: ">=2.5.0"
---
# 🗂️ Advanced Tab Management
**Core Philosophy:** Modern workflows require multitasking. Manage your browser tabs like a pro.

- **Keep Context:** If you need to reference documentation while interacting with an app, open it in a new tab. Use `browser_tabs` to seamlessly switch between them.
- **Handle Popups:** Sites will often open OAuth flows or external links in new tabs automatically. Be aware of your current active tab and switch contexts when necessary.
- **Clean Up:** Don't leave 50 tabs open. Close tabs you no longer need to keep your working memory and the browser clean.
