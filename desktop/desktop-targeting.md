---
id: desktop-targeting
domain: desktop
triggers:
  - "automate desktop app"
  - "send message in slack"
  - "edit in vscode"
  - "switch to discord"
  - "desktop app routing"
tools:
  - "browser_map"
  - "browser_click"
  - "browser_type"
  - "browser_fill"
  - "browser_detect"
  - "browser_tabs"
  - "browser_navigate"
weavetab: ">=2.5.0-beta.3"
---

# Desktop App Targeting & Multi-Window Routing

Once a desktop application is detected via `browser_detect`, every standard Weavetab tool can be scoped directly to that desktop application without opening or disturbing the user's web browser.

---

## 1. Direct App Parameter Routing

Pass `"app": "<application_name>"` to target the Electron application.

### Example: Reading Discord Channels
```json
// Tool: browser_map
{
  "app": "discord",
  "scope": "main_content"
}
```

### Example: Sending a Message in Discord
```json
// Tool: browser_type
{
  "app": "discord",
  "ref": "w:88",
  "text": "Deployment v2.5.0-beta.3 completed successfully."
}
```

### Example: Listing Discord Tabs/Windows
```json
// Tool: browser_tabs
{
  "action": "list",
  "app": "discord"
}
```

> [!IMPORTANT]
> Always pass `"app": "discord"` (or the target app name) to `browser_tabs` when working with desktop apps. This prevents Weavetab from accidentally launching or switching to the web browser.

---

## 2. Smart Domain Auto-Routing & Sticky Context

Weavetab features automatic target resolution to eliminate accidental browser popups:

### A. Automatic Domain Matching
If you call `browser_navigate` or `browser_tabs(action: "open")` with a known domain (e.g. `discord.com`, `slack.com`, `linear.app`, `notion.so`), Weavetab automatically routes the command to the configured Electron desktop application.

### B. Sticky App Sessions
When you interact with an Electron application (e.g., clicking or typing in Discord), Weavetab remembers the active application context. If a subsequent tool call omits `app` and no web browser instance is active, Weavetab stays attached to the active desktop app rather than spawning an unwanted Chrome window.

### C. Explicit Browser Override
If you specifically want to open a URL in the web browser instead of a desktop application, pass `"app": "browser"`.

---

## 3. Multi-Window Focus Management

Some Electron apps open secondary windows (e.g. popout editors, settings panels, or call windows).

1. Use `browser_tabs(action: "list", app: "discord")` to view all open windows and page targets for that specific app.
2. Switch focus between windows using `browser_tabs(action: "switch", tabId: "<id>", app: "discord")`.
3. To bring a specific native window to the foreground, use `browser_tabs(action: "focus_window", windowId: <id>, app: "discord")`.
