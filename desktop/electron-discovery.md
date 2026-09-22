---
id: electron-discovery
domain: desktop
triggers:
  - "discover electron apps"
  - "detect desktop apps"
  - "connect to slack"
  - "connect to discord"
  - "connect to vscode"
  - "electron automation"
tools:
  - "browser_detect"
weavetab: ">=2.5.0-beta.4"
---

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
