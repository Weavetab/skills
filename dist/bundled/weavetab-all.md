# Weavetab Complete Enterprise Agent Suite (v2.5.0-beta.4)



# ====================================================
# DOMAIN: BROWSER
# ====================================================

# Weavetab Domain Profile: BROWSER

Generated for @weavetab/skills v2.5.0-beta.4


## dom-strategy

# DOM Strategy & Token Conservation Engine

When parsing modern web applications, naive DOM dumps can consume 50,000+ tokens and cause agent degradation. Weavetab provides a high-efficiency 4-tier reading architecture.

---

## 1. The 4-Tier Reading Filter

Always select the narrowest tool that satisfies your immediate objective:

```
                  ┌───────────────────────────────┐
                  │ Do you need full structural   │
                  │ context or just a target?     │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [Specific Target]                 [Whole Document]
                 │                               │
        ┌────────┴────────┐              ┌───────┴────────┐
        ▼                 ▼              ▼                ▼
  Target by text   Target by role   Read articles     Interactive
   or keywords      or hierarchy     or prose data     UI layout
        │                 │              │                │
        ▼                 ▼              ▼                ▼
  `browser_find`   `browser_map`   `browser_scrape`  `browser_map`
                   (lite: true)                      (lite: true)
                                                          │
                                     [Sparse / Canvas / WebGL / <5 elements?]
                                                          │
                                                          ▼
                                                    `browser_map`
                                                  (visual: "auto")
```

### Tier 1: Targeted Keyword Jump (`browser_find`)
Use `browser_find` when you already know the label, text snippet, placeholder, or aria-label of the target element.
- **Latency**: Sub-5ms CDP search.
- **Token Cost**: ~50–100 tokens (returns only matching candidate nodes).

```json
{
  "query": "Sign In",
  "matchType": "contains",
  "visibleOnly": true
}
```

### Tier 2: Token-Optimized DOM Walk (`browser_map` with `lite: true`)
Use `browser_map` when you must understand the interactive structure of the page.
- **Rule**: ALWAYS pass `"lite": true` unless you strictly need deeply nested non-interactive DOM trees.
- **Efficiency**: Strips decorative wrappers, SVG paths, hidden containers, and scripts. Reduces payload by **85% to 95%**.
- **Viewport Filtering**: Set `"includeOffscreen": false` to only inspect elements currently visible in the active viewport.

```json
{
  "lite": true,
  "includeOffscreen": false,
  "maxDepth": 6
}
```

### Tier 3: Markdown Prose & Data Ingestion (`browser_scrape`)
Use `browser_scrape` when your objective is reading articles, blog posts, documentation, or legal terms rather than clicking buttons.
- Converts HTML to clean, semantically structured Markdown.
- Automatically handles readability filtering and removes advertising/cookie banners.

### Tier 4: Set-of-Marks Visual Grounding (`browser_map` with `visual: "auto"`)
Use when target pages are canvas-heavy, WebGL, Figma, Google Sheets, or when standard `browser_map` returns < 5 interactive elements.
- Injects temporary numbered badges `[1]…[N]` over interactive elements & canvas regions.
- Captures an annotated screenshot + returns a structured mark list.
- **Zero Page Pollution**: Strips badges immediately after capture.
- **Action**: Pass `"mark": N` to `browser_click` to click the exact element without re-scanning the DOM.

```json
{
  "visual": "auto"
}
```

---

## 2. Volatile Ref ID & Visual Mark Navigation

Weavetab maps elements to ephemeral handles (`w:NN`) and visual marks (`[1]…[N]`):

### Operational Rules:
1. **Never Construct Speculative CSS Selectors**: If an element has ref `w:14`, pass `"ref": "w:14"` to `browser_click`, `browser_fill`, `browser_type`.
2. **Visual Mark Targeting**: On canvas or unlabelled elements from `visual: "auto"`, pass `"mark": N` directly to `browser_click({ mark: N })`.
3. **Lifespan of Handles**: Ref IDs and marks invalidate on page navigation (`browser_navigate`) or heavy SPA re-renders. 
4. **Recovery on Invalidation**: If an action fails with `ELEMENT_NOT_FOUND` or `MARK_NOT_FOUND`, re-run `browser_map({ visual: "auto" })` to refresh active handles.


## form-automation

# Form Automation: Atomic Multi-Field Execution

Submitting complex web forms one field at a time wastes agent turns and increases the probability of layout shifts. Weavetab provides atomic multi-field batching and native dropdown selectors.

---

## 1. Atomic Multi-Field Filling (`browser_fill`)

`browser_fill` populates multiple inputs, textareas, checkboxes, and radio buttons in a single CDP roundtrip.

```json
{
  "fields": [
    {
      "ref": "w:12",
      "value": "Anas"
    },
    {
      "ref": "w:14",
      "value": "Khezaz"
    },
    {
      "ref": "w:16",
      "value": "contact@weavetab.com"
    },
    {
      "ref": "w:19",
      "value": true
    }
  ]
}
```

### Supported Field Value Types:
- **Text / Search / Email / Tel**: Provide a `string`.
- **Checkbox**: Provide a `boolean` (`true` to check, `false` to uncheck).
- **Radio Buttons**: Provide `true` on the matching option ref.
- **ContentEditable**: Provide a `string` (automatically handles inner text formatting).

---

## 2. Dropdown & Select Automation (`browser_select`)

Standard `<select>` elements and custom dropdowns often fail under simple click-and-type automation. `browser_select` dispatches native CDP change events.

```json
{
  "ref": "w:31",
  "values": ["enterprise_tier"]
}
```

### Multi-Select Support:
For `<select multiple>` elements, pass an array of option values:

```json
{
  "ref": "w:35",
  "values": ["us-east-1", "eu-central-1"]
}
```

---

## 3. Form Submission Best Practices

1. **Pre-Validate State**: Before clicking Submit, confirm that required fields have passed HTML5/client-side validation (no active red borders or validation popups).
2. **Submit via Enter Key vs Click**:
   - If the submit button has a dynamic ref or changes during typing, send `"key": "Enter"` via `browser_key` inside the last filled text field.
   - Otherwise, locate the submit button via `browser_find` and click via `browser_click`.
3. **Wait for Post-Submission Route**: Always follow form submission with `browser_wait` for URL changes or target DOM confirmation rather than immediately firing subsequent actions.


## interaction-pipeline

# Interaction Pipeline: Physical & Synthetic Input Engine

Weavetab executes browser interactions via direct Chrome DevTools Protocol (CDP) dispatch, bypassing synthetic JavaScript event limitations and anti-automation tripwires.

---

## 1. Clicking Elements (`browser_click`)

Execute deterministic clicks on DOM elements using volatile handles (`ref`), CSS selectors, or exact coordinates.

```json
{
  "ref": "w:23",
  "clickCount": 1,
  "button": "left"
}
```

### Advanced Modifiers:
- **Double Click**: Set `"clickCount": 2` for inline editing or selecting text blocks.
- **Context Menu**: Set `"button": "right"` to trigger native context menus.
- **Modifier Keys**: Pass `"modifiers": ["Control"]` or `["Meta"]` for multi-selection or opening links in background tabs.

---

## 2. Text Input (`browser_type`)

Simulate natural keystrokes into input fields, textareas, and `contenteditable` elements.

```json
{
  "ref": "w:18",
  "text": "Enterprise Search Query",
  "clear": true,
  "delay": 20
}
```

> [!CAUTION]
> **Secret Boundary Enforcement**:
> NEVER use `browser_type` for passwords, API tokens, or payment card data. Always route sensitive credentials through [`security/secret-containment-protocol.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/security/secret-containment-protocol.md) via `browser_type_secret`.

---

## 3. Physical Pointer Trajectories (`browser_pointer`)

Handle complex drag-and-drop interactions, canvas sketching, hover-activated navigation flyouts, and custom sliders.

### Hover / Mouse Move:
```json
{
  "action": "move",
  "x": 450,
  "y": 180
}
```

### Drag & Drop Pipeline:
```json
// Step 1: Move to origin & press mouse
{ "action": "move", "x": 200, "y": 300 }
{ "action": "down", "button": "left" }

// Step 2: Smooth trajectory to destination
{ "action": "move", "x": 600, "y": 300 }

// Step 3: Release
{ "action": "up", "button": "left" }
```

---

## 4. Keystrokes & Shortcuts (`browser_key`)

Trigger keyboard shortcuts, navigation keys, and dialog dismissals.

```json
{
  "key": "Enter"
}
```

### High-Frequency Key Combos:
- **Select All & Delete**: Send `"key": "a"`, `"modifiers": ["Control"]` (or `["Meta"]` on macOS), followed by `"key": "Backspace"`.
- **Dismiss Overlays**: Send `"key": "Escape"`.
- **Form Tab Navigation**: Send `"key": "Tab"`.

---

## 5. OS File Upload Bypass (`browser_upload`)

Native operating system file picker dialogs block autonomous agent execution because they operate outside the browser DOM. Weavetab bypasses this entirely using CDP's `DOM.setFileInputFiles`.

```json
{
  "ref": "w:41",
  "files": [
    "C:/Users/fy2ne/Documents/contract.pdf",
    "C:/Users/fy2ne/Documents/financial_report.xlsx"
  ]
}
```

- **Targeting**: Supply the volatile handle `ref` or CSS selector for the `<input type="file">`.
- **Hidden Inputs**: `browser_upload` automatically handles `display: none` file inputs commonly used in custom drag-and-drop upload widgets.

---

## 6. Viewport & Element Scrolling (`browser_scroll`)

Scroll the entire page viewport or scroll specific scrollable containers:

```json
{
  "direction": "down",
  "amount": 500
}
```

Or scroll a specific element container:
```json
{
  "ref": "w:12",
  "direction": "down",
  "amount": 300
}
```

---

## 7. Native Dialog Handling (`browser_dialog`)

Handle native JavaScript `alert`, `confirm`, `prompt`, or `beforeunload` dialogs that block page execution:

```json
{
  "action": "accept",
  "promptText": "Confirmed"
}
```

---

## 8. High-Speed Action Batches (`browser_burst`)

Execute multiple sequential micro-actions in a single CDP roundtrip to defeat race conditions:

```json
{
  "actions": [
    { "tool": "browser_click", "args": { "ref": "w:10" } },
    { "tool": "browser_wait", "args": { "timeout": 50 } },
    { "tool": "browser_click", "args": { "ref": "w:15" } }
  ]
}
```

---

## 9. Visual Element Highlighting & Consideration (`browser_highlight`)

Draw visual consideration, target lock, danger/success, or shimmer overlays without mutating the DOM. Supports multi-element candidate evaluation:

```json
{
  "refs": ["w:12", "w:15", "w:23"],
  "style": "consideration",
  "label": "Evaluating form options",
  "duration": 2000
}
```

### Presentation Styles:
- `"consideration"`: Soft pulsing cyan/blue outline (`#38bdf8`) with ambient glow — ideal when weighing multiple interactive candidates.
- `"target"`: High-contrast amber lock-on ring (`#f59e0b`) before executing high-impact clicks.
- `"danger"`: Red warning border (`#ef4444`) for destructive buttons (Delete, Reset, Purge).
- `"success"`: Emerald glow (`#10b981`) confirming completed actions.
- `"shimmer"`: Rapid purple accent wave (default for quick inspection).

---

## 10. System Clipboard Bridging (`browser_clipboard`)

Read or write system clipboard text during automation:

```json
{
  "action": "write",
  "text": "AuthToken_xyz987"
}
```


## tab-and-window

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


# ====================================================
# DOMAIN: DESKTOP
# ====================================================

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


# ====================================================
# DOMAIN: MEMORY
# ====================================================

# Weavetab Domain Profile: MEMORY

Generated for @weavetab/skills v2.5.0-beta.4


## selector-memory-system

# Two-Tier Memory System

Weavetab operates a two-tier persistent memory system. Understanding both layers prevents wasted DOM traversals and makes agents dramatically faster across sessions.

---

## Tier 1 — Selector Confidence Cache (`~/.weavetab-system/memory/`)

Per-domain JSON files (one per hostname) track individual element selectors and their interaction history.

Every time an element is located and interacted with, Weavetab calculates a confidence score based on:
1. **Attribute Stability**: Prefers `data-testid`, `id`, `aria-label`, and semantic roles over dynamic Tailwind/CSS-module class strings.
2. **Success Count**: Selectors that successfully trigger navigation or state changes gain reinforcement.
3. **Origin Isolation**: Learned selectors are strictly namespaced to the origin to prevent cross-site contamination.

### Strike Degradation
- **Strike 1**: Marked as degraded — falls back to secondary candidates or fuzzy label match.
- **Strike 2**: Deprecated — immediate fallback to full DOM inspection via `browser_find` or `browser_map`.
- **Strike 3**: Purged from memory cache to prevent stale lookups.

### Agent Discipline for Tier 1
1. **Rely on Native Tool Resolution**: When you pass a `ref`, Weavetab queries both the active volatile registry and the Tier 1 memory cache automatically.
2. **Don't Hardcode Fragile Selectors**: Never pass brittle absolute CSS paths like `div:nth-child(3) > ul > li:nth-child(2) > button`.
3. **Trust Heuristic Recovery**: If a button moves slightly on the page, the underlying engine re-anchors before reporting failure.

---

## Tier 2 — Site Profiles & Workflow Patterns (`~/.weavetab-system/memory/sites/`)

One JSON file per origin stores named multi-step workflow patterns, site quirks, and reliability scores. This is the **Intelligent Memory** layer — agents learn entire flows, not just individual selectors.

### Checking a Site Profile at Session Start
Always call `browser_memory_profile` when starting an automation session on a site you may have visited before:

```json
{ "origin": "https://github.com" }
```

Response tells you:
- `known_patterns`: named flows with reliability scores and step counts
- `quirks`: known cookie banners, rate limits, modal popups to handle automatically
- `framework`: detected frontend stack
- `_hint`: compact hint string summarizing everything

### Fast-Path Decision Rule
| Reliability | Action |
|---|---|
| **≥ 0.8** | Use pattern steps directly via `browser_burst` — skip exploratory navigation |
| **0.5 – 0.79** | Attempt pattern but verify success indicator before moving on |
| **< 0.5 or strikes ≥ 3** | Ignore pattern, re-explore from scratch, then teach via `browser_pattern_learn` |

### Teaching a New Pattern After Completing a Workflow
After successfully completing a multi-step flow:

```json
{
  "origin": "https://github.com",
  "action": "learn",
  "name": "login_flow",
  "steps": [
    { "tool": "browser_click", "target": ".btn-login" },
    { "tool": "browser_fill", "target": "#login_field", "value": "{{username}}" },
    { "tool": "browser_fill", "target": "#password", "value": "{{password}}" },
    { "tool": "browser_click", "target": "[type=submit]" }
  ],
  "success_indicator": "a[aria-label='Homepage']"
}
```

### Recording Execution Outcomes (Reliability Upkeep)
After replaying a pattern, always report the outcome:

```json
{
  "origin": "https://github.com",
  "action": "record_execution",
  "name": "login_flow",
  "success": true,
  "duration_ms": 3200
}
```

### Recording Site Quirks
When you discover a cookie banner or rate limit:

```json
{
  "origin": "https://github.com",
  "action": "record_quirk",
  "quirk_key": "cookie_banner",
  "quirk_data": { "selector": "#cookie-consent", "action": "click .accept-all", "appears": "first_visit" }
}
```

On future visits, the quirk is present in the profile so you can dismiss banners before starting your main workflow — zero wasted agent turns.

---

## File Locations (Never Write to ~/.weavetab/)

| Tier | Path | Owner |
|---|---|---|
| Tier 1 selectors | `~/.weavetab-system/memory/<hostname>.json` | Engine (auto) |
| Tier 2 site profiles | `~/.weavetab-system/memory/sites/<origin>.json` | Engine via `browser_pattern_learn` |
| Knowledge hints | `~/.weavetab-system/knowledge/<hostname>.md` | Engine (auto, 20-token notes) |
| User config | `~/.weavetab/config.json` | Human — never written by agents |


## session-trail

# Session Trails & Deterministic Macro Compilation

When an agent executes an exploratory workflow (e.g. logging into a dashboard, navigating to analytics, setting date filters, and downloading a CSV), re-running that flow autonomously in the future should not require 15 reasoning steps.

`browser_macro_compile` converts recent session actions into a high-performance, deterministic execution script.

---

## 1. Compiling Recent Actions (`browser_macro_compile`)

Extract and optimize the trail of actions taken in the active session:

```json
{
  "name": "daily_metric_export",
  "stripRedundant": true,
  "parameterizeInputs": true
}
```

### Response Example:
```json
{
  "macroId": "macro_8f7b2c",
  "name": "daily_metric_export",
  "stepsCount": 5,
  "parameters": ["startDate", "endDate"],
  "code": "// Auto-generated Weavetab Deterministic Pipeline\nawait session.navigate('https://analytics.example.com');\nawait session.click('[data-testid=\"export-btn\"]');\n..."
}
```

---

## 2. Parameterizing Variable Inputs

When `"parameterizeInputs": true` is passed:
- Text inputs and dates entered during the exploratory session are replaced with named parameters.
- Secrets entered via `browser_type_secret` are never hardcoded; they are replaced with environment variable or secret lookups.

---

## 3. Replaying Compiled Automations

Compiled macros can be executed in sub-second time without LLM inference overhead using `browser_automation`:

```json
{
  "macroId": "macro_8f7b2c",
  "parameters": {
    "startDate": "2026-09-01",
    "endDate": "2026-09-03"
  }
}
```

---

## 4. Emitting Operational Thoughts (`browser_thoughts`)

Log agent rationale and internal reasoning directly to the Weavetab HUD and telemetry stream without bloating user chat responses:

```json
{
  "thought": "Detected dynamic React hydration delay. Holding interaction until DOM mutation settles."
}
```


# ====================================================
# DOMAIN: RESILIENCE
# ====================================================

# Weavetab Domain Profile: RESILIENCE

Generated for @weavetab/skills v2.5.0-beta.4


## loop-breaker

# Loop Breaker & CAPTCHA Escalation Protocol

Agents can get trapped in repetitive click loops when a button does not advance the state (e.g. failing silent validation, unhandled reCAPTCHA challenges, or modals swallowing events). Weavetab actively monitors repetitive patterns and provides circuit breakers.

---

## 1. Loop Detection & Strike Reset (`browser_reset_loop_counter`)

Weavetab tracks the sequence of identical or near-identical tool invocations. If an agent calls `browser_click` on the same selector or ref 3+ times without URL or major DOM mutations, the server raises a `POTENTIAL_LOOP_DETECTED` warning.

### How to Break the Loop:
1. **Analyze Why the Action Failed**: Check `browser_console` for JavaScript errors or use `browser_map` to see if a validation banner popped up.
2. **Reset the Circuit Breaker**: Once you have diagnosed the issue and adjusted your plan, call `browser_reset_loop_counter` to reset the strike counter:

```json
{}
```

---

## 2. CAPTCHA Handling Protocol (`browser_captcha`)

When an automated flow is blocked by Cloudflare Turnstile, Google reCAPTCHA, or hCaptcha, do NOT repeatedly click random coordinates.

Invoke `browser_captcha` to analyze and manage the challenge:

```json
{
  "action": "detect"
}
```

### Response Example:
```json
{
  "detected": true,
  "type": "turnstile",
  "provider": "cloudflare",
  "interactive": true,
  "ref": "w:99"
}
```

### Action Strategy:
1. If the challenge is interactive and requires human intervention (e.g. image classification), inform the user cleanly or request human bypass.
2. If the challenge is a simple checkbox Turnstile widget, pass `"action": "solve"` or click the detected widget ref with `browser_click`.


## session-time-travel

# Session Time-Travel & Instant State Rollback

In complex multi-step workflows (e.g. checkout funnels, multi-page configuration wizards, onboarding questionnaires), an error at Step 7 traditionally forces an agent to reload the root URL, re-authenticate, and waste 10+ turns repeating steps.

`browser_checkpoint` enables instantaneous time-travel by snapshotting and restoring complete browser session state.

---

## 1. What a Checkpoint Captures

A single named checkpoint atomically preserves:
- **Cookies**: Full domain cookies including `HttpOnly`, `Secure`, and `SameSite` flags.
- **Web Storage**: Entire `localStorage` and `sessionStorage` key-value maps.
- **Navigation State**: Exact page URL, scroll positions (`x`, `y`), and page title.

---

## 2. Checkpoint Operations

### A. Saving a Checkpoint (`save`)
Create a checkpoint right before undertaking risky, branching, or destructive actions:

```json
{
  "action": "save",
  "name": "pre_checkout_authenticated"
}
```

### B. Restoring a Checkpoint (`restore`)
If a downstream step errors out, times out, or hits an invalid state, roll back immediately:

```json
{
  "action": "restore",
  "name": "pre_checkout_authenticated"
}
```
*Latency: ~15ms*. The page navigates back to the checkpoint URL with cookies and storage atomically injected.

### C. Listing Checkpoints (`list`)
Inspect all active checkpoints for the current page target:

```json
{
  "action": "list"
}
```

### D. Cleaning Up (`delete`)
Free memory once a workflow has concluded:

```json
{
  "action": "delete",
  "name": "pre_checkout_authenticated"
}
```

---

## 3. High-Leverage Agent Pattern

```
1. Authenticate to Target Portal
2. browser_checkpoint({ action: "save", name: "auth_ready" })
3. Attempt automated action sequence (e.g. form filling or testing)
4. IF error occurs:
     browser_checkpoint({ action: "restore", name: "auth_ready" })
     -> Agent is immediately back at authenticated state without re-login!
```

---

## 4. Fine-Grained Cookie Management (`browser_cookies`)

Inspect, set, or delete individual browser session cookies without restoring an entire checkpoint:

```json
{
  "action": "get",
  "urls": ["https://example.com"]
}
```

Or inject an authentication cookie:
```json
{
  "action": "set",
  "cookies": [
    {
      "name": "session_token",
      "value": "xyz123",
      "domain": "example.com",
      "httpOnly": true,
      "secure": true
    }
  ]
}
```

---

## 5. Web Storage Inspection & Injection (`browser_storage`)

Query or clear `localStorage` and `sessionStorage` keys:

```json
{
  "storageType": "localStorage",
  "action": "get",
  "key": "authToken"
}
```


## stale-ref-recovery

# Stale Ref Recovery & SPA Hydration Resilience

In modern Single Page Applications (built with React, Next.js, Vue, Nuxt, Svelte), DOM nodes are frequently destroyed and recreated during client-side hydration or reactive state updates. This often causes `STALE_ELEMENT_REFERENCE` or `NODE_DETACHED` errors when an agent attempts an action.

---

## 1. The 4-Tier Auto-Recovery Chain

When a tool receives a stale or missing `ref`, Weavetab does not immediately fail. It activates an internal 4-tier recovery chain:

```
  [Action on w:14 Fails / Stale]
                │
                ▼
  [Tier 1: Stored Selector] ──▶ Re-queries cached stable selector (data-testid, id)
                │ (if not found)
                ▼
  [Tier 2: Exact Label Match] ──▶ Queries element with identical visible text & tag
                │ (if not found)
                ▼
  [Tier 3: Semantic Role Match] ──▶ Queries nearest sibling with matching ARIA role
                │ (if not found)
                ▼
  [Tier 4: Fuzzy Match] ──▶ Re-anchors to highest-confidence visual candidate
```

If the recovery chain succeeds, the action executes seamlessly and the return payload notifies the agent that the handle was refreshed.

---

## 2. Agent Reactive Behavior

If an action returns `ERROR: STALE_ELEMENT_REFERENCE` because all 4 recovery tiers were exhausted:

1. **Do NOT Repeat the Identical Call**: Retrying the exact same stale `ref` (`w:14`) will fail again.
2. **Execute a Fast Targeted Lookup**: Run `browser_find` with the text of the button or input field.
3. **Execute the Action on the New Handle**: Use the updated handle returned by `browser_find`.


# ====================================================
# DOMAIN: SECURITY
# ====================================================

# Weavetab Domain Profile: SECURITY

Generated for @weavetab/skills v2.5.0-beta.4


## rbac-and-policies

# Role-Based Access Control (RBAC) & Agent Guardrails

Weavetab allows developers to run untrusted or lower-privilege subagents within strict security boundaries to prevent accidental destructive operations or data leaks.

---

## 1. The 4 Security Tiers

| Tier | Name | Allowed Tools & Capabilities | Intended Role |
| :--- | :--- | :--- | :--- |
| **0** | `admin` | Full tool access (all 48 tools), plugin loading, arbitrary script eval, cookies/storage write. | Primary Operator / Lead Agent. |
| **1** | `operator` | Interactive tools (`browser_click`, `browser_fill`, `browser_upload`), but blocked from loading untrusted plugins. | Standard Automation Agent. |
| **2** | `automation` | Pre-approved deterministic macros (`browser_automation`), scoped form filling, no arbitrary script execution. | Background Cron / Worker. |
| **3** | `viewer` | Read-only inspection tools (`browser_map`, `browser_find`, `browser_scrape`, `browser_inspect`). All click, type, and storage tools are rejected with `PERMISSION_DENIED`. | Research Subagents / Scrapers. |

---

## 2. Handling `PERMISSION_DENIED` Errors

If an agent attempts an action outside its allocated role tier:
```json
{
  "error_code": "PERMISSION_DENIED",
  "message": "Tool 'browser_click' is disabled under role 'viewer'. Only read operations are permitted."
}
```

### Protocol:
1. Do not retry the denied tool.
2. Delegate the interactive action to the parent agent or primary operator.
3. Limit your output to findings gathered via read-only tools (`browser_scrape`, `browser_map`, `browser_inspect`).


## secret-containment-protocol

# Secret Containment Protocol & Zero-Bleed Execution

AI agent transcripts, LLM providers, and tool logs represent massive attack surfaces for credential leaks. Weavetab enforces a hardware-grade **Zero-Bleed Security Guarantee** for sensitive inputs.

---

## 1. Entering Credentials with `browser_type_secret`

Whenever an agent inputs passwords, two-factor backup codes, credit card numbers, or proprietary API keys, you MUST use `browser_type_secret`:

```json
{
  "ref": "w:12",
  "secret": "MySuperSecretPassword!2026",
  "clear": true
}
```

---

## 2. The Zero-Bleed Guarantee Architecture

When `browser_type_secret` is invoked:
1. **CDP Interception**: The secret is typed via masked CDP synthetic key events.
2. **HUD Redaction**: The browser Heads-Up Display (HUD) and visual overlay strictly renders bullets (`••••••••`).
3. **Log Sanitization**: Console logs, MCP server logs, and JSON return values strip the secret string and return:
   ```json
   {
     "success": true,
     "message": "Secret typed successfully into ref 'w:12' (length: 26). Value redacted."
   }
   ```
4. **No Re-Emission**: Never print or echo raw credentials into subsequent model thoughts or conversation messages.

---

## 3. Strict Operating Prohibition

> [!CAUTION]
> Under NO circumstances should an agent pass passwords or credentials to:
> - `browser_type`
> - `browser_fill`
> - `browser_eval`
> 
> Doing so causes plaintext secrets to enter unmasked transcripts and tool logs.


# ====================================================
# DOMAIN: PLUGINS
# ====================================================

# Weavetab Domain Profile: PLUGINS

Generated for @weavetab/skills v2.5.0-beta.4


## hooks-and-overrides

# Plugin Hooks & Lifecycle Overrides

Plugins built with `@weavetab/sdk` register lifecycle hooks that run before and after tool executions. Understanding these hooks helps agents interpret metadata and custom tool responses.

---

## 1. Supported Plugin Hooks

1. **`beforeToolCall(toolName, args)`**:
   - Validates arguments against custom enterprise schemas.
   - Injects tenant IDs, authentication headers, or proxy routing.
2. **`afterToolCall(toolName, result, durationMs)`**:
   - Emits OpenTelemetry metrics and timing waterfalls to external APM platforms.
   - Enriches return objects with contextual metadata.
3. **`onNavigate(url, targetId)`**:
   - Triggers automated cookie injection or session setup upon page navigation.

---

## 2. Agent Operational Awareness

When plugins are active, tool return payloads may include an optional `_pluginMetadata` object containing trace IDs, custom metrics, or security audit timestamps. Agents should treat this object as informational telemetry.


## plugin-runtime

# Plugin Runtime: Dynamic Extension Loading

Weavetab features an extensible plugin architecture powered by `@weavetab/sdk`. Agents can query loaded extensions and dynamically load community or official plugins into the live MCP runtime without restarting the server.

---

## 1. Inspecting Active Plugins (`list_plugins`)

Discover all installed plugins, their versions, and the tools or hooks they expose:

```json
{}
```

### Response Example:
```json
{
  "plugins": [
    {
      "name": "@weavetab/plugin-recaptcha-solver",
      "version": "1.2.0",
      "status": "active",
      "toolsProvided": ["captcha_solve_token"],
      "hooks": ["beforeToolCall"]
    }
  ]
}
```

---

## 2. Dynamic Runtime Loading (`load_plugin`)

Load a verified plugin package into the active runtime session:

```json
{
  "name": "@weavetab/plugin-datadog-tracer"
}
```

### Plugin Verification Guarantees:
- Plugins must implement the `@weavetab/sdk` standard interface.
- Loaded tools become immediately callable by the agent in subsequent turns.
- If an agent is in the `viewer` RBAC tier, `load_plugin` is rejected with `PERMISSION_DENIED`.


# ====================================================
# DOMAIN: NETWORK-AND-PERF
# ====================================================

# Weavetab Domain Profile: NETWORK-AND-PERF

Generated for @weavetab/skills v2.5.0-beta.4


## device-and-environment

# Device Emulation & Environment Simulation

Auditing mobile responsive layouts, testing geographic restrictions, and simulating degraded network conditions can all be accomplished with `browser_emulate`.

---

## 1. Device Presets & Viewport Simulation

Switch from desktop to realistic mobile hardware profiles:

```json
{
  "device": "iPhone 15 Pro",
  "orientation": "portrait"
}
```

Or configure custom screen geometries:

```json
{
  "viewport": {
    "width": 393,
    "height": 852,
    "deviceScaleFactor": 3,
    "isMobile": true,
    "hasTouch": true
  }
}
```

---

## 2. Network Throttling Simulation

Verify how web applications degrade under poor connectivity:

```json
{
  "network": {
    "offline": false,
    "downloadThroughput": 1024 * 500, // 500 kb/s (Slow 3G)
    "uploadThroughput": 1024 * 250,
    "latency": 400 // ms
  }
}
```

---

## 3. Geolocation & Timezone Overrides

Bypass localized IP redirects or verify localized content rendering:

```json
{
  "geolocation": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "accuracy": 100
  },
  "timezoneId": "America/Los_Angeles",
  "locale": "en-US"
}
```

To reset all overrides back to default host system parameters:
```json
{
  "reset": true
}
```


## network-intercept-and-mock

# Network Interception, Mocking & TLS Forensics

Autonomous testing and debugging often require simulating backend error states (e.g. 500 Internal Server Error, 429 Rate Limit), stubbing third-party analytics, or verifying TLS/SSL certificates.

`browser_network_intercept` provides fine-grained CDP request and response modification.

---

## 1. Mocking API Responses

Intercept outgoing HTTP requests matching a URL pattern and return custom mock data:

```json
{
  "pattern": "*/api/v1/user/profile",
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "{\"id\": \"usr_test\", \"role\": \"admin\", \"credits\": 9999}"
  }
}
```

---

## 2. Blocking Unnecessary Traffic & Trackers

Accelerate page loads and eliminate token bloat by aborting non-essential requests:

```json
{
  "pattern": "*google-analytics.com*",
  "action": "abort",
  "errorReason": "BlockedByClient"
}
```

---

## 3. TLS / SSL Forensics & Timing Waterfalls

Extract cryptographic handshake metadata, cipher suites, expiration dates, and microsecond network waterfalls (DNS lookup, TCP connect, SSL handshake, TTFB):

```json
{
  "action": "auditTls",
  "url": "https://weavetab.pages.dev"
}
```

### Response Example:
```json
{
  "security": {
    "protocol": "TLS 1.3",
    "cipher": "AES_128_GCM",
    "issuer": "Let's Encrypt",
    "validTo": "2026-11-15T00:00:00.000Z"
  },
  "waterfall": {
    "dnsMs": 1.4,
    "tcpMs": 3.2,
    "sslMs": 4.1,
    "ttfbMs": 12.8
  }
}
```


## performance-and-vitals

# Performance Forensics & Core Web Vitals

Optimizing agent execution and auditing client performance requires objective metrics rather than arbitrary sleep timers.

---

## 1. Core Web Vitals Auditing (`browser_performance`)

Retrieve Google Core Web Vitals, memory consumption, and frame rendering bottlenecks directly from the Chromium engine:

```json
{
  "metrics": ["vitals", "memory", "navigationTiming"]
}
```

### Response Example:
```json
{
  "vitals": {
    "fcp": 320,
    "lcp": 780,
    "cls": 0.012,
    "fid": 8,
    "inp": 45
  },
  "memory": {
    "jsHeapUsedSizeMb": 42.1,
    "jsHeapTotalSizeMb": 68.4
  }
}
```

---

## 2. Deterministic Synchronization (`browser_wait`)

> [!WARNING]
> NEVER call arbitrary fixed sleep timers (e.g. `sleep 5000`). Fixed sleeps waste user time and still fail when network latency spikes.

Always synchronize with deterministic browser conditions:

### Wait for Network Idle:
```json
{
  "condition": "network_idle",
  "timeout": 10000
}
```

### Wait for DOM Mutation Stability:
```json
{
  "condition": "dom_stable",
  "duration": 500,
  "timeout": 10000
}
```

### Wait for a Specific Element to Appear:
```json
{
  "condition": "element_visible",
  "selector": "[data-testid=\"checkout-complete\"]",
  "timeout": 15000
}
```


# ====================================================
# DOMAIN: DOCUMENTS
# ====================================================

# Weavetab Domain Profile: DOCUMENTS

Generated for @weavetab/skills v2.5.0-beta.4


## canvas-and-visual-capture

# Visual Capture, Canvas Forensics & Design Extraction

Beyond textual DOM manipulation, modern web applications contain dynamic HTML5 canvas renderings (charts, maps, WebGL games), and agents often need high-fidelity visual artifacts.

---

## 1. Targeted Screenshots (`browser_screenshot`)

Capture full page layouts, the visible viewport, or specific element bounding boxes:

```json
{
  "fullPage": true,
  "format": "png"
}
```

Or target a specific element ref:
```json
{
  "ref": "w:55",
  "format": "jpeg",
  "quality": 80
}
```

---

## 2. PDF Document Generation (`browser_pdf`)

Render the current page into a print-ready PDF document with print CSS styles applied:

```json
{
  "landscape": false,
  "printBackground": true,
  "paperWidth": 8.5,
  "paperHeight": 11
}
```

---

## 3. HTML5 Canvas Pixel Inspection & Visual Grounding (`browser_canvas` & `browser_map`)

When a chart or graphic is rendered via `<canvas>`, standard DOM reading tools cannot see individual buttons or nodes. You have two strategies:

### A. Set-of-Marks Visual Grounding (Recommended for Canvas UIs & WebGL)
Run `browser_map({ visual: "auto" })`. It detects canvas elements and high-contrast regions, attaches numbered badges `[1]…[N]`, and returns an annotated image:
```json
{
  "visual": "auto"
}
```
Then interact directly by mark number without guessing pixel coordinates:
```json
{
  "mark": 3
}
```

### B. Direct Canvas Pixel Export (`browser_canvas`)
To extract the raw image data or draw programmatic gesture paths:
```json
{
  "ref": "w:19",
  "action": "toDataURL"
}
```

---

## 4. Design System Extraction (`browser_extract_design`)

Reverse-engineer UI stylesheets, active CSS custom properties (variables), typography scales, and color palettes:

```json
{
  "selector": ".antigravity-hud-panel"
}
```

Returns structured JSON representing colors, font families, shadows, and spacing tokens.


## office-document-ingestion

# Office Document Ingestion: Word, Excel & CSV Parsing

Agents frequently need to parse structured spreadsheets or corporate documents downloaded during automation runs. `browser_office` parses `.docx`, `.xlsx`, `.xls`, and `.csv` files directly into clean JSON structures.

---

## 1. Parsing Spreadsheets (`.xlsx`, `.csv`)

Stream structured sheet data, headers, and cell values:

```json
{
  "filePath": "C:/Users/fy2ne/Downloads/quarterly_revenue.xlsx",
  "sheet": "Q3_Summary",
  "headerRow": 1,
  "maxRows": 100
}
```

### Response Example:
```json
{
  "fileType": "xlsx",
  "sheets": ["Q1", "Q2", "Q3_Summary"],
  "rowCount": 45,
  "data": [
    { "Department": "Engineering", "Budget": 1250000, "Actual": 1180000 },
    { "Department": "Marketing", "Budget": 600000, "Actual": 620000 }
  ]
}
```

---

## 2. Ingesting Word Documents (`.docx`)

Extract semantic paragraphs, document headings, tables, and lists:

```json
{
  "filePath": "C:/Users/fy2ne/Documents/service_agreement.docx",
  "extractTables": true
}
```

### Operational Advantages:
- Eliminates the need for heavy external Python libraries or microservices.
- Safely sanitizes binary formats before passing content into LLM context.


# ====================================================
# DOMAIN: DEVELOPER
# ====================================================

# Weavetab Domain Profile: DEVELOPER

Generated for @weavetab/skills v2.5.0-beta.4


## github-forensics

# GitHub Forensics & Repository Architecture Inspection

Navigating GitHub repositories via web browsing burns massive token budgets loading HTML chrome, comment threads, and diff trees. Weavetab includes dedicated GitHub inspection tools that interact directly with git metadata and APIs.

---

## 1. High-Level Repository Analysis (`github_analyze`)

Quickly summarize repo structure, languages, dependency graphs, and recent commit frequency:

```json
{
  "repo": "Weavetab/MCP"
}
```

---

## 2. Reading Repository Source Files (`github_read`)

Directly stream files and directories from any public or authenticated GitHub repo without cloning:

```json
{
  "repo": "Weavetab/MCP",
  "path": "src/server.ts",
  "ref": "main"
}
```

---

## 3. Pull Request Forensics (`github_get_pr`)

Retrieve PR diffs, review comments, CI checks, and mergeability status:

```json
{
  "repo": "Weavetab/MCP",
  "prNumber": 42
}
```

---

## 4. Issue Triage & Search (`github_issues`)

Query repository issue trackers with state, label, and keyword filters:

```json
{
  "repo": "Weavetab/MCP",
  "state": "open",
  "labels": ["bug", "priority"]
}
```
