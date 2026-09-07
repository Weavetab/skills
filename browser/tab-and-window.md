---
id: tab-and-window
domain: browser
triggers:
  - "switch tab"
  - "open tab"
  - "close tab"
  - "list tabs"
  - "tab crash recovery"
  - "heal tabs"
  - "desktop app tabs"
tools:
  - "browser_tabs"
weavetab: ">=2.5.0-beta.3"
---

# Tab & Window Lifecycle Management

Multi-tab workflows (OAuth popups, payment gateways, documentation references, desktop application windows) require deterministic tab switching, window focusing, and failure recovery. `browser_tabs` controls all CDP page and window targets.

---

## 1. Tab Discovery & Target Enumeration

Inspect all active targets, open URLs, and page titles:

```json
{
  "action": "list"
}
```

To list targets inside a specific desktop app (e.g. Discord, Slack):
```json
{
  "action": "list",
  "app": "discord"
}
```

> [!TIP]
> Always pass `"app": "<name>"` when inspecting desktop applications. This guarantees that Weavetab does not launch or query the web browser.

---

## 2. Opening Tabs & Smart Reuse

Open a target URL. By default, `reuse: true` will focus an existing tab if the URL is already loaded:

```json
{
  "action": "open",
  "url": "https://github.com"
}
```

To force opening a brand-new duplicate tab instead of reusing:
```json
{
  "action": "open",
  "url": "https://github.com",
  "reuse": false
}
```

---

## 3. Context Switching

Switch active agent focus between open tabs:

```json
{
  "action": "switch",
  "tabId": "TARGET_PAGE_ID"
}
```

---

## 4. Closing Tabs & Batch Cleanup

Close a single tab:
```json
{
  "action": "close",
  "tabId": "TARGET_PAGE_ID"
}
```

Close multiple tabs simultaneously in a single round-trip:
```json
{
  "action": "close",
  "tabIds": ["TARGET_1", "TARGET_2", "TARGET_3"]
}
```

---

## 5. Native Window Management

List native OS windows:
```json
{
  "action": "list_windows"
}
```

Bring a specific native window to the foreground:
```json
{
  "action": "focus_window",
  "windowId": 1
}
```

---

## 6. Duplicate Consolidation & Auto-Heal

Deduplicate redundant tabs across the session:
```json
{
  "action": "consolidate"
}
```

If a target page crashes or detaches due to memory limits:
```json
{
  "action": "heal"
}
```

The auto-heal routine re-establishes CDP protocol sessions, reconnects event listeners, and synchronizes the active page target.
