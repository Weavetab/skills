# Weavetab Domain Profile: DESKTOP

Generated for @weavetab/skills v2.5.0-beta.4


## desktop-targeting

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


## electron-discovery

# Electron Discovery & Environment Handshake

Modern desktop applications (Discord, Slack, VS Code, Notion, Obsidian, Figma) are built on Chromium and Electron. Weavetab can inspect and drive these native applications through standard CDP interfaces without third-party drivers or OS-level accessibility hacks.

`browser_detect` is the **critical initialization handshake** tool. Every agent should call `browser_detect` before interacting with the user's desktop environment to gain immediate situational awareness.

---

## 1. Running Discovery via `browser_detect`

Call `browser_detect` with empty parameters `{}`:

```json
{}
```

### Response Schema:
```json
{
  "available": [
    {
      "engine": "chromium",
      "name": "Google Chrome",
      "path": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    }
  ],
  "current": "chromium",
  "configuredApps": [
    {
      "name": "discord",
      "status": "running_no_debug",
      "configuredPath": "C:\\Users\\username\\AppData\\Local\\Discord\\app-1.0.9256\\Discord.exe"
    },
    {
      "name": "slack",
      "status": "connected",
      "port": 9222,
      "configuredPath": "C:\\Users\\username\\AppData\\Local\\slack\\app-4.38.125\\slack.exe",
      "activeTabs": [
        {
          "id": "PAGE_1",
          "title": "general - Weavetab Slack",
          "url": "https://app.slack.com/client/..."
        }
      ]
    },
    {
      "name": "vscode",
      "status": "offline",
      "configuredPath": "C:\\Users\\username\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"
    }
  ],
  "toolCoverage": {
    "chromium": 100,
    "firefox": 78,
    "webkit": 55
  }
}
```

---

## 2. Understanding Application Status

Each configured desktop app reports one of three distinct lifecycle statuses:

| Status | Meaning | Agent Action |
| :--- | :--- | :--- |
| **`connected`** | App is running with CDP remote debugging active. Weavetab has an active session. | Immediately interact using any tool with `"app": "<name>"`. Tabs and port are available. |
| **`running_no_debug`** | The app process is currently open on the user's OS, but was launched normally by the user without `--remote-debugging-port`. | Do NOT send click/type commands. To attach, inform the user or close and launch via `browser_navigate(app: "<name>")` so Weavetab supplies the debugging port. |
| **`offline`** | The application is not currently running on the OS. | Launch and attach in one step by calling `browser_navigate(app: "<name>")`. |

---

## 3. Dynamic Squirrel Updates on Windows

On Windows, Squirrel-managed applications (Discord, Slack, Teams) update dynamically into versioned sibling directories (e.g. `Discord\app-1.0.9256\Discord.exe`). 

Weavetab automatically handles this:
- If a configured path points to an outdated version or the parent folder, Weavetab scans the directory, resolves the highest semantic version folder (`app-1.0.xxxx`), and launches the valid executable.
- The dynamically resolved path is reported in `browser_detect` under `configuredPath`.

---

## 4. Launching Desktop Apps Manually with Debugging

If the user prefers to launch apps manually from a terminal or shortcut with remote debugging enabled:

```bash
# Discord
Discord.exe --remote-debugging-port=9222

# Slack
slack.exe --remote-debugging-port=9223

# VS Code
code.exe --remote-debugging-port=9225
```

Once launched with `--remote-debugging-port`, `browser_detect` immediately reflects the application as connectable.
