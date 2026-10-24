# Weavetab Complete Enterprise Agent Suite (v2.5.1)



# ====================================================
# DOMAIN: BROWSER
# ====================================================

# Weavetab Domain Profile: BROWSER

Generated for @weavetab/skills v2.5.1


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
  "query": "Sign In"
}
```

Set `"all": true` to return every match (with `"limit"` capping the count, default 10) instead of only the first.

### Tier 2: Token-Optimized DOM Walk (`browser_map` with `lite: true`)
Use `browser_map` when you must understand the interactive structure of the page.
- **Rule**: ALWAYS pass `"lite": true` unless you strictly need deeply nested non-interactive DOM trees.
- **Efficiency**: Strips decorative wrappers, SVG paths, hidden containers, and scripts. Reduces payload by **85% to 95%**.
- **Scope & filter**: Narrow a dense page with `"scope": "main"` (or `navigation`, `sidebar`, `form`, `modal`, `utility`) and `"query": "<substring>"` to filter by label/role.
- **Delta mode**: Set `"delta": true` on repeated maps to receive only what changed since the last call (up to 97% token savings).
- **Pruning**: Set `"prune": true` to drop hidden, non-interactive subtrees and collapse SVG icons in this snapshot.

```json
{
  "lite": true,
  "scope": "main",
  "delta": true
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

### Tier 5: Runtime State & JavaScript Evaluation (`browser_eval`)
When DOM nodes are occluded or you need direct access to in-memory window state (e.g. Redux store, localStorage keys, or complex canvas dimensions), use `browser_eval` as an escape hatch:
```json
{
  "expression": "window.__INITIAL_STATE__ || document.title"
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
      "value": "Alex"
    },
    {
      "ref": "w:14",
      "value": "Rivera"
    },
    {
      "ref": "w:16",
      "value": "contact@weavetab.com"
    },
    {
      "ref": "w:19",
      "value": "true"
    }
  ]
}
```

### Supported Field Value Types:
Every `value` is a **string**.
- **Text / Search / Email / Tel**: The literal text to type.
- **Checkbox / ARIA switch**: A truthy string (`"true"`, `"yes"`, `"checked"`, `"1"`, or `"on"`) checks it; anything else unchecks it.
- **Radio Buttons**: Set the matching option's ref to a truthy string to select it.
- **Select**: The option `value` or visible text to choose.
- **ContentEditable**: The text content to set (inner text formatting handled automatically).

---

## 2. Dropdown & Select Automation (`browser_select`)

Standard `<select>` elements and custom dropdowns often fail under simple click-and-type automation. `browser_select` dispatches native CDP change events.

```json
{
  "ref": "w:31",
  "value": "enterprise_tier"
}
```

`value` is a **single string** (required) and matches either the option's `value` or its visible text, trimmed. For a custom ARIA/React dropdown it opens the popover, scans `[role="option"]`/`[role="menuitem"]` candidates, and clicks the best match.

### Multi-Select Support:
`browser_select` selects one option per call. For a `<select multiple>` element, call it once per option you want selected.

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

Execute deterministic clicks on DOM elements using volatile handles (`ref`/`id`), CSS selectors, labels, marks, or coordinates.

```json
{
  "ref": "w:23"
}
```

### Targeting & Options:
- **By ref**: pass `id` (or its alias `ref`) from `browser_map`.
- **By selector / label**: pass `selector` (alias `target`) or `label` (visible text or aria-label).
- **By visual mark**: pass `mark: N` from `browser_map({ visual: "auto" })` for canvas/WebGL pages.
- **By coordinates**: pass `x`/`y`, or a raw `backendNodeId`.
- **`intent`**: an optional semantic description (e.g. `"submit login form"`) — Weavetab checks learned memory first and clicks a high-confidence selector without DOM resolution.
- **`include_map`**: set `true` to return a refreshed page map with the result.

> `browser_click` always dispatches a left-button single click. To double-click or right-click, use `browser_pointer` (`double_click`) or open the native context menu another way.

---

## 2. Text Input (`browser_type`)

Simulate natural keystrokes into input fields, textareas, and `contenteditable` elements.

```json
{
  "ref": "w:18",
  "text": "Enterprise Search Query",
  "clearFirst": true
}
```

Useful options:
- **`clearFirst`**: wipe existing field content before typing.
- **`paste`**: instant paste mode via clipboard, auto-enabled for text longer than 8 chars.
- If `id`/`selector`/`label` is omitted, text is typed into the currently focused element.

> [!CAUTION]
> **Secret Boundary Enforcement**:
> NEVER use `browser_type` for passwords, API tokens, or payment card data. Always route sensitive credentials through [`security/secret-containment-protocol.md`](../security/secret-containment-protocol.md) via `browser_type_secret`.

---

## 3. Physical Pointer Trajectories (`browser_pointer`)

Handle complex drag-and-drop interactions, canvas sketching, hover-activated navigation flyouts, and custom sliders.

Actions: `hover`, `click`, `double_click`, `drag_and_drop`, `hover_chain`.

### Hover:
```json
{
  "action": "hover",
  "ref": "w:12",
  "waitForChild": ".submenu",
  "holdMs": 200
}
```

### Double Click:
```json
{
  "action": "double_click",
  "ref": "w:30"
}
```

### Drag & Drop Pipeline:
A single `drag_and_drop` action drives the whole drag — supply the source (`ref`/`selector`/`x`/`y`) and destination (`end_ref`/`end_selector`/`end_x`/`end_y`):
```json
{
  "action": "drag_and_drop",
  "ref": "w:20",
  "end_ref": "w:35"
}
```

### Multi-Level Flyout Menus (`hover_chain`):
Hover each element in order and click the last one (e.g. Photoshop/Figma-style menus):
```json
{
  "hover_chain": ["File", "Export As", "PNG"]
}
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
- **Select All & Delete**: Send `"key": "a"` with `"modifiers": ["Ctrl"]` (or `["Meta"]` on macOS), followed by `"key": "Backspace"`.
- **Dismiss Overlays**: Send `"key": "Escape"`.
- **Form Tab Navigation**: Send `"key": "Tab"`.

Valid modifiers are `Alt`, `Ctrl`, `Meta`, and `Shift`.

---

## 5. OS File Upload Bypass (`browser_upload`)

Native operating system file picker dialogs block autonomous agent execution because they operate outside the browser DOM. Weavetab bypasses this entirely using CDP's `DOM.setFileInputFiles`.

```json
{
  "nodeId": 4821,
  "filePaths": [
    "C:/Users/me/Documents/contract.pdf",
    "C:/Users/me/Documents/financial_report.xlsx"
  ]
}
```

- **Targeting**: Supply the CDP `nodeId` (backendNodeId) of the `<input type="file">` element — obtain it from `browser_map`, `browser_inspect`, or `browser_find` output.
- **Hidden Inputs**: `browser_upload` automatically handles `display: none` file inputs commonly used in custom drag-and-drop upload widgets.

---

## 6. Viewport & Element Scrolling (`browser_scroll`)

Scroll the entire page viewport or scroll specific scrollable containers:

```json
{
  "direction": "down",
  "distance": 500
}
```

Or scroll a specific element container:
```json
{
  "ref": "w:12",
  "direction": "down",
  "distance": 300
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

Execute multiple sequential micro-actions in a single CDP roundtrip without waiting for intermediate LLM turns:

```json
{
  "steps": [
    { "tool": "browser_type", "ref": "w:10", "text": "search query" },
    { "tool": "click_and_wait", "ref": "w:15" }
  ]
}
```

Macro steps (`type_and_send`, `click_and_wait`, `navigate_and_read`, `scroll_and_read`, `fill_form`) collapse common two-step patterns into one entry. *(Accepts both `steps` and `actions`, with arguments either nested under `args` or specified flat on the step object.)*

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

Generated for @weavetab/skills v2.5.1


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
  "text": "Deployment v2.5.1 completed successfully."
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

Generated for @weavetab/skills v2.5.1


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
Always call `browser_pattern_learn` with `action: "get"` when starting an automation session on a site you may have visited before:

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
| Knowledge hints | `~/.weavetab/knowledge/<hostname>.md` | Engine (auto, 20-token notes) |
| User config | `~/.weavetab/config.json` | Human — never written by agents |


## session-trail

# Session Trails & Deterministic Macro Compilation

When an agent executes an exploratory workflow (e.g. logging into a dashboard, navigating to analytics, setting date filters, and downloading a CSV), re-running that flow autonomously in the future should not require 15 reasoning steps.

`browser_burst` with `compile_from_history: true` converts recent successful session actions into a deterministic, replayable macro.

---

## 1. Compiling and Replaying Recent Actions (`browser_burst`)

Replay recent successful actions directly in a single turn:

```json
{
  "compile_from_history": true
}
```

Or pass `dry_run: true` to inspect the compiled macro steps before running them:

```json
{
  "compile_from_history": true,
  "dry_run": true,
  "history_limit": 15
}
```

### Response Example:
```json
{
  "success": true,
  "steps_completed": 0,
  "compiled_steps": [
    { "tool": "browser_navigate", "args": { "url": "https://analytics.example.com" } },
    { "tool": "browser_type", "args": { "ref": "w:12", "text": "metrics" } },
    { "tool": "click_and_wait", "args": { "ref": "w:15" } }
  ],
  "message": "compiled 3 macro steps from history"
}
```

Compiled steps reuse the exact arguments the original tool calls carried (for example a `browser_fill` step keeps its `fields` array). `history_limit` caps how many recent trail entries are considered (default 20).

---

## 2. What Gets Compiled

The compiler walks the session trail and keeps only successful steps whose tool is replayable (clicks, typing, navigation, keys, scroll, select, wait, fill, and similar). It:
- Drops failed steps.
- De-duplicates consecutive identical calls.
- Exposes the result as `compiled_steps` with `args` nested under each step.

Because secrets entered via `browser_type_secret` are referenced by environment-variable key (`envKey`) rather than plaintext, compiled macros never contain credentials.

---

## 3. Background Scripts (`browser_automation`)

For recurring monitoring or polling that should run without an LLM turn, `browser_automation` injects a self-running script into the page:

```json
{
  "action": "start",
  "id": "price_watch",
  "script": "setInterval(() => document.querySelector('#price')?.textContent, 5000)",
  "persistent": true,
  "onResult": "store"
}
```

- **`action`**: `start`, `stop`, `list`, or `poll`.
- **`id`**: unique script identifier (required for `start`/`stop`).
- **`script`**: the JavaScript to inject (required for `start`).
- **`persistent`**: re-run in a loop when `true`.
- **`onResult`**: `notify_agent`, `store` (default), or `ignore`.

Scripts are cleared on tab close — do not rely on them for expensive, long-running work.

---

## 4. Emitting Operational Thoughts (`browser_thoughts`)

Log agent rationale and internal reasoning directly to the Weavetab HUD and telemetry stream without bloating user chat responses:

```json
{
  "action": "feedback",
  "message": "Detected dynamic React hydration delay. Holding interaction until DOM mutation settles.",
  "style": "observation"
}
```

Use `"action": "question"` to surface a free-text question to the user (with `input` set to `sentence` or `paragraph`, and an optional `timeout`).


## site-learning

# Site Learning — Autonomous Workflow Memory

Weavetab's Site Learning engine accumulates cross-session knowledge about websites and multi-step automation flows. Each site gets one profile file at `~/.weavetab-system/memory/sites/<origin>.json` — never duplicated, always merged on write.

A profile holds `framework`, `captcha_frequency`, `quirks`, and named `patterns` (each with `steps`, `reliability`, `strikes`, and execution counters).

---

## 1. Session Start Protocol

On every session visiting a known or potentially-known site, run:

```json
{ "action": "get", "origin": "https://github.com" }
```

`action` defaults to `"learn"`, so `get` must be stated explicitly. If `origin` is omitted, `get` reads the active tab's origin.

Parse the response:
- `known: false` → the site is new; proceed exploratorily and teach it after completion.
- `_hint` → a compact text summary listing `framework`, `captcha_frequency`, `known_patterns` (with reliability and step counts), and `quirks`.
- `quirks` → auto-handle any listed quirks (cookie banners, rate limits) before the main task.

---

## 2. Fast-Path vs. Exploratory Decision

Use the per-pattern `reliability` (and `strikes`) values to choose your strategy:

| Reliability | Strikes | Strategy |
|---|---|---|
| ≥ 0.8, strikes = 0 | — | **Fast path**: replay the stored steps via `browser_burst` directly |
| 0.5–0.79 | 0–1 | **Cautious path**: replay steps, verify `success_indicator` after each critical step |
| < 0.5 | any | **Re-explore**: navigate manually, collect correct steps, then teach |
| any | ≥ 3 | **Re-learn**: ignore the cached pattern, re-explore, then `learn` again with updated steps |

The `_hint` string flags eligible patterns with `[fast-path eligible]` and stale ones with `[RE-LEARN NEEDED]`.

---

## 3. Quirk Auto-Handling

If a profile lists quirks, resolve them immediately after navigation before executing your main task. Example stored quirk data:

```
{ "cookie_banner": { "selector": "#cookie-consent", "action": "click .accept-all", "appears": "first_visit" } }
```

Execute the action before doing anything else. Never spend reasoning turns on a known dismissible popup.

---

## 4. Teaching a Workflow Pattern

After successfully completing a multi-step flow for the first time (or after re-learning):

```json
{
  "action": "learn",
  "origin": "https://github.com",
  "name": "login_flow",
  "steps": [
    { "tool": "browser_navigate", "target": "https://github.com/login" },
    { "tool": "browser_fill", "target": "#login_field", "value": "{{username}}" },
    { "tool": "browser_fill", "target": "#password", "value": "{{password}}" },
    { "tool": "browser_click", "target": "[type=submit]" }
  ],
  "success_indicator": "a[aria-label='Homepage']",
  "entry": "/login"
}
```

Each step accepts `tool`, an optional `target` (selector or URL), an optional `value`, and an optional `extra` object forwarded verbatim to `browser_burst` replay.

**Pattern Naming Rules**:
- Use snake_case.
- Be descriptive: `login_flow`, `pr_review`, `csv_export`, `checkout_flow`.
- A duplicate name on the same origin is an **update** (merge) — it never creates a second pattern.

**Step Quality Rules**:
- Prefer semantic selectors: `data-testid`, `id`, `aria-label`, readable text-based selectors.
- Avoid hashed classes (`.hash_abc123`), positional selectors (`div:nth-child(4)`), and deep anonymous chains (`div > div > div > span`) — the engine drops volatile selectors during compilation.
- For sensitive inputs, record a placeholder like `{{username}}` — never hardcode credentials.

---

## 5. Reliability Upkeep After Replay

Every time you replay a pattern, report the outcome:

```json
{
  "action": "record_execution",
  "origin": "https://github.com",
  "name": "login_flow",
  "success": true,
  "duration_ms": 3100
}
```

`success` is required. The engine updates reliability via EWMA (α=0.15):
- A success nudges reliability toward 1.0 (and resets `strikes` to 0).
- A failure lowers reliability and increments `strikes`; 3 consecutive failures trigger a re-learn flag.

If no pattern with that name exists for the origin, the call returns `error_code: "PATTERN_NOT_FOUND"`.

---

## 6. Recording a New Quirk

When you encounter a cookie consent modal, popup, or rate limit for the first time:

```json
{
  "action": "record_quirk",
  "origin": "https://example.com",
  "quirk_key": "cookie_banner",
  "quirk_data": {
    "selector": "#cookie-consent",
    "action": "click .accept-all",
    "appears": "first_visit"
  }
}
```

Supported `quirk_key` values: `cookie_banner`, `rate_limit`, `modal_popups`.

For rate limits:

```json
{
  "action": "record_quirk",
  "origin": "https://example.com",
  "quirk_key": "rate_limit",
  "quirk_data": { "threshold": "60req/min", "recovery": "wait 30s" }
}
```

---

## 7. Anti-Patterns to Avoid

- **Never create per-session pattern names** like `login_2026_09_16` — one name per workflow per origin, forever updated in place.
- **Never call `browser_pattern_learn` in a loop** — one call per workflow completion. The write is idempotent (skips the disk write if nothing changed).
- **Never store credentials in steps** — use placeholders or `browser_type_secret` during actual execution.
- **Never write to `~/.weavetab/`** — all memory belongs in `~/.weavetab-system/memory/sites/`.

---

## 8. Full Session Example: GitHub PR Review

```
1. browser_pattern_learn { action: "get", origin: "https://github.com" }
   → known_patterns: pr_review (reliability 0.95, 3 steps) [fast-path eligible]
   → quirks: none

2. Since reliability = 0.95 (≥ 0.8): use the fast path.
   browser_burst with the 3 stored steps.

3. After completion:
   browser_pattern_learn {
     action: "record_execution",
     name: "pr_review",
     origin: "https://github.com",
     success: true,
     duration_ms: 2800
   }
```

Total agent turns for a known site: **3 tool calls** vs. potentially 12+ with full exploration.


# ====================================================
# DOMAIN: RESILIENCE
# ====================================================

# Weavetab Domain Profile: RESILIENCE

Generated for @weavetab/skills v2.5.1


## loop-breaker

# Loop Breaker & CAPTCHA Escalation Protocol

Agents can get trapped in repetitive click loops when a button does not advance the state (e.g. failing silent validation, unhandled reCAPTCHA challenges, or modals swallowing events). Weavetab actively monitors repetitive patterns and provides circuit breakers.

---

## 1. Loop Detection & Strike Reset (`browser_map`)

Weavetab tracks the sequence of identical or near-identical tool invocations. If an agent calls `browser_click` or `browser_type` on the same selector or ref repeatedly without URL or major DOM mutations, the server raises a `STUCK_LOOP_WARNING`.

### How to Break the Loop:
1. **Analyze Why the Action Failed**: Check `browser_console` for JavaScript errors:
   ```json
   { "action": "read" }
   ```
   Or use `browser_map` to see if a validation banner or unhandled modal appeared.
2. **Reset the Circuit Breaker**:
   - Re-map with `force: true` to bypass the map skip guard, refresh the DOM view, and automatically clear loop strikes:
     ```json
     { "force": true }
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
  "success": true,
  "action": "detect",
  "captcha_detected": true,
  "captcha_type": "turnstile",
  "interaction_type": "checkbox",
  "difficulty": "easy",
  "confidence": 0.97,
  "human_needed": false,
  "message": "CAPTCHA detected: turnstile (checkbox, 97% confidence)",
  "next_action": "Call browser_captcha({ action: \"solve\" }) to attempt automated solving."
}
```

### Action Strategy:
1. If `human_needed` is `true` (e.g. image classification), inform the user cleanly or request human bypass — do not guess coordinates.
2. Otherwise pass `"action": "solve"` to attempt an automated solve (slider drag, hold, checkbox, or invisible challenges). Use `"action": "status"` to check progress and `"action": "wait_for_user"` to pause for human input.


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
  "url": "https://example.com"
}
```

Or inject an authentication cookie (one cookie per call):

```json
{
  "action": "set",
  "name": "session_token",
  "value": "xyz123",
  "domain": "example.com",
  "path": "/",
  "httpOnly": true,
  "secure": true,
  "sameSite": "Lax"
}
```

Delete a cookie by name (and optionally domain/path):

```json
{
  "action": "delete",
  "name": "session_token",
  "domain": "example.com"
}
```

Accepted fields: `name`, `value`, `domain`, `path`, `expires` (Unix seconds), `httpOnly`, `secure`, `sameSite` (`Strict`/`Lax`/`None`), and `url` (for `get`).

---

## 5. Web Storage Inspection & Injection (`browser_storage`)

Query or clear `localStorage` and `sessionStorage` keys. Choose the store with `scope`:

```json
{
  "scope": "local",
  "action": "get",
  "key": "authToken"
}
```

- **`scope`**: `"local"` or `"session"`.
- **`action`**: `get`, `set`, `remove`, `list` (all keys + values), or `clear` (the whole scope).
- **`key`** is required for `get`, `set`, and `remove`; **`value`** is required for `set`.


## stale-ref-recovery

# Stale Ref Recovery & SPA Hydration Resilience

In modern Single Page Applications (built with React, Next.js, Vue, Nuxt, Svelte), DOM nodes are frequently destroyed and recreated during client-side hydration or reactive state updates. This can invalidate a volatile `w:NN` handle between reads and actions.

---

## 1. The Multi-Tier Auto-Recovery Heuristic

When a tool receives a detached or invalidated `ref`, Weavetab attempts to re-resolve it instead of failing immediately. The recovery runs a sub-5ms heuristic over these strategies (in order) and re-stamps `data-wt-id="NN"` onto the live node:

```
  [Action on w:14 fails / handle detached]
                 │
                 ▼
  [1. Connected node + fingerprint check]
                 │ (if not found)
                 ▼
  [2. Stored CSS selector]  (data-testid, id, class)
                 │ (if not found)
                 ▼
  [3. Exact label / aria-label match]
                 │ (if not found)
                 ▼
  [4. Placeholder / name attribute match]
                 │ (if not found)
                 ▼
  [5. Fuzzy substring match]  (when label length >= 3)
```

The successful strategy is reported back to the agent (`stored_selector`, `exact_label`, `placeholder_or_name`, `fuzzy_label`). If every strategy misses, the tool returns a hard failure.

---

## 2. Agent Reactive Behavior

If an action fails because all recovery strategies were exhausted, the tool returns one of:

- `error_code: "ELEMENT_NOT_FOUND"` — the ref was in the cached map but no longer exists in the DOM.
- `error_code: "FINGERPRINT_MISMATCH"` — an element exists but its tag/role fingerprint no longer matches; the DOM was likely rebuilt.

Either way:

1. **Do NOT Repeat the Identical Call**: retrying the exact same stale `ref` (`w:14`) will fail again.
2. **Execute a Fast Targeted Lookup**: run `browser_find` with the text of the button or input, or refresh handles with `browser_map`.
3. **Execute the Action on the New Handle**: use the updated ref returned by `browser_find`/`browser_map`.


# ====================================================
# DOMAIN: SECURITY
# ====================================================

# Weavetab Domain Profile: SECURITY

Generated for @weavetab/skills v2.5.1


## rbac-and-policies

# Role-Based Access Control (RBAC) & Agent Guardrails

Weavetab allows developers to run untrusted or lower-privilege subagents within strict security boundaries to prevent accidental destructive operations or data leaks.

Roles are configured per agent (in `config.json`). The server checks the role **before** launching a browser or resolving the target.

---

## 1. The 5 Security Roles

| Role | Tool Access | Intended Use |
| :--- | :--- | :--- |
| `admin` | Full access (`*`). | Primary operator / lead agent. |
| `operator` | Full access (`*`). | Standard automation agent. |
| `automation` | Every tool except `browser_thoughts` — automation agents must be non-interactive. | Background cron / worker. |
| `viewer` | Read-only set only: `browser_map`, `browser_find`, `browser_scrape`, `browser_console`, `browser_eval`, `browser_inspect`, `browser_extract_design`, `browser_snapshot`, `browser_screenshot`, `browser_pdf`, `browser_cookies`, `browser_tabs`, `browser_wait`, `browser_pattern_learn`. | Research subagents / scrapers. |
| `system` | `browser_thoughts`, `browser_detect`, `browser_performance`, `browser_checkpoint`, `browser_pattern_learn`. | Internal/system operations. |

Any other role value is treated as fully allowed.

---

## 2. Handling Permission Denials

There is no JSON `error_code` for RBAC. A denied call fails with `isError: true` and a plain-text message prefixed with `[!]`:

```
[!] Role 'viewer' does not have permission to use 'browser_click'. Viewer role only permits read-only tools (map/find/scrape/console/eval/inspect/snapshot/pdf/cookies).
```

### Protocol:
1. Do not retry the denied tool — the role will not change mid-session.
2. Delegate the interactive action to the parent agent or a higher-privilege operator.
3. Limit your output to findings gathered via read-only tools (`browser_scrape`, `browser_map`, `browser_inspect`).


## secret-containment-protocol

# Secret Containment Protocol & Zero-Bleed Execution

AI agent transcripts, LLM providers, and tool logs represent massive attack surfaces for credential leaks. Weavetab enforces a hardware-grade **Zero-Bleed Security Guarantee** for sensitive inputs.

---

## 1. Entering Credentials with `browser_type_secret`

Whenever an agent inputs passwords, two-factor backup codes, credit card numbers, or proprietary API keys, you MUST use `browser_type_secret`.

`browser_type_secret` never accepts a plaintext secret. It reads the value from an **environment variable** on the host running the MCP server, so the secret never reaches the agent transcript. Set the variable first (e.g. `export PORTAL_PASSWORD="…"`), then reference it by key:

```json
{
  "ref": "w:12",
  "envKey": "PORTAL_PASSWORD"
}
```

Accepted targeting parameters: `id` (alias `ref`) or `target` (CSS selector). `envKey` is **required**.

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

Generated for @weavetab/skills v2.5.1


## hooks-and-overrides

# Plugin Hooks & Lifecycle Overrides

Plugins built with `@weavetab/sdk` register lifecycle hooks that run before and after tool executions. Understanding these hooks helps agents interpret custom tool behavior and blocked actions.

---

## 1. Supported Plugin Hooks

The `PluginHooks` interface exposes three primary interceptors (with backwards-compatible aliases):

1. **`onBeforeAction(handler)`** — *alias:* `beforeToolCall`
   - `handler(tool, args, session)` runs **before** any tool executes.
   - It may return a modified `args` object (replacing the arguments) or `{ __blocked: true, reason }` to abort the call.
   - Typical uses: argument validation, tenant/header injection, proxy routing.
2. **`onAfterAction(handler)`** — *alias:* `afterToolCall`
   - `handler(tool, result, session, args)` runs **after** a tool completes.
   - Its return value replaces the tool result — used for telemetry, timing, or enriching output.
3. **`onDOMMutation(handler)`** — *alias:* `onPageNavigate`
   - `handler(delta, session)` observes real-time DOM mutation / action deltas (added, removed, and changed elements, `significantChange`, `stable_count`).

---

## 2. Agent Operational Awareness

- A blocked action surfaces as a normal tool error (the server turns `__blocked` into an error result). If a plugin blocks a tool you expected to succeed, do not retry it blindly — report the block reason and pick another approach.
- An `onAfterAction` handler can rewrite a tool's result. Treat the returned payload as authoritative, not a fixed schema.
- Plugins never inject plaintext secrets into results; the Redaction Layer runs on all error output (`SessionSecretTracker.redactAll`).


## plugin-runtime

# Plugin Runtime: Weavetab Plugin Architecture

Weavetab features an extensible plugin architecture powered by `@weavetab/sdk`. All installed plugins are loaded automatically at server startup — their tools appear directly in the MCP tool list alongside built-in tools. Agents never need to discover or activate plugins manually.

---

## 1. How Plugin Tools Appear

Plugin tools are first-class MCP tools. If `@weavetab/plugin-recaptcha-solver` is installed, `captcha_solve_token` appears in the tool list immediately on startup — alongside built-ins such as `browser_snapshot` — with no discovery step needed.

There is no MCP tool for discovering or activating plugins. Managing plugins is a CLI operation:

```bash
# Install a plugin (restart required)
weavetab plugin add @weavetab/plugin-youtube

# Remove a plugin
weavetab plugin rm @weavetab/plugin-youtube

# List installed plugins
weavetab plugin list
```

---

## 2. Plugin Permission Model

Every plugin declares what it can do in `weavetab.json`. The runtime enforces this at load time:

| Permission | What it gates |
|---|---|
| `tools.add: true` | Plugin can register new MCP tools |
| `tools.override: ["browser_navigate"]` | Plugin can wrap/replace that built-in tool |
| `tools.remove: ["browser_pdf"]` | Plugin can disable that built-in tool |
| `hooks.onBeforeAction: true` | Plugin can intercept all tool calls before execution |
| `hooks.onAfterAction: true` | Plugin can inspect/transform all tool results |

Plugins that attempt to exceed their declared permissions are blocked with a stderr warning — they do not crash.

---

## 3. Trust Tiers

| Tier | Badge | Condition |
|---|---|---|
| Official | `✚ [Official]` | `@weavetab/plugin-*` packages |
| Verified | `✔ [Verified]` | Listed in the Weavetab verified registry |
| Unverified | `⚠ [Unverified]` | Unknown community package |

Unverified plugins are loaded but their permissions are logged visibly at startup for user review.


# ====================================================
# DOMAIN: NETWORK-AND-PERF
# ====================================================

# Weavetab Domain Profile: NETWORK-AND-PERF

Generated for @weavetab/skills v2.5.1


## device-and-environment

# Device Emulation & Environment Simulation

Auditing mobile responsive layouts, testing geographic restrictions, and simulating degraded network conditions are split across two tools: `browser_viewport` owns device geometry, locale, timezone, and color-scheme emulation; `browser_emulate` owns network throttling and CPU slowdown.

---

## 1. Device Presets & Viewport Simulation (`browser_viewport`)

List the available hardware presets, then apply one:

```json
{ "action": "list" }
```

```json
{
  "action": "preset",
  "devicePreset": "iPhone 15 Pro"
}
```

Or configure custom screen geometry directly with `action: "set"`:

```json
{
  "action": "set",
  "width": 393,
  "height": 852,
  "deviceScaleFactor": 3,
  "mobile": true,
  "hasTouch": true,
  "screenOrientation": "portrait"
}
```

Clear all viewport and emulation overrides back to the host defaults:

```json
{ "action": "clear" }
```

---

## 2. Network & CPU Throttling (`browser_emulate`)

Verify how web applications degrade under poor connectivity:

```json
{
  "network": {
    "offline": false,
    "downloadThroughput": 512000,
    "uploadThroughput": 256000,
    "latency": 400
  },
  "cpuThrottlingRate": 4
}
```

Use a named profile for common cases (`"slow3g"`, `"fast3g"`, `"4g"`, `"offline"`, `"online"`):

```json
{ "network": "slow3g" }
```

---

## 3. Geolocation, Timezone, Locale & Color Scheme (`browser_viewport`)

Bypass localized IP redirects or verify localized content rendering:

```json
{
  "action": "set",
  "geolocation": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "accuracy": 100
  },
  "timezoneId": "America/Los_Angeles",
  "locale": "en-US",
  "colorScheme": "dark"
}
```


## network-intercept-and-mock

# Network Interception, Mocking & Telemetry

Autonomous testing and debugging often require simulating backend error states (e.g. 500 Internal Server Error, 429 Rate Limit), stubbing third-party analytics, or inspecting real request timing and TLS metadata.

`browser_network_intercept` exposes four actions: `enable`, `disable`, `get_telemetry`, and `clear_telemetry`.

---

## 1. Mocking API Responses (`enable`)

`enable` requires a `pattern` (URL glob). Every matching response is fulfilled with your mock:

```json
{
  "action": "enable",
  "pattern": "*/api/v1/user/profile",
  "mockStatus": 200,
  "mockBody": "{\"id\": \"usr_test\", \"role\": \"admin\", \"credits\": 9999}"
}
```

- **`pattern`** — URL glob, e.g. `*api/users*`. `*` and `?` are treated as wildcards.
- **`mockStatus`** — HTTP status to return (default `200`). Use `500`/`429`/`404` to simulate failures.
- **`mockBody`** — response body string (default `{}`). Pass JSON as a string.

Mocks are served from the extension when present, otherwise via CDP's Fetch domain (fallback mode).

---

## 2. Stopping Interception (`disable`)

Return the browser to live traffic when a test completes:

```json
{
  "action": "disable"
}
```

---

## 3. Network Telemetry (`get_telemetry`)

`get_telemetry` starts a background capture (if not already running) and returns the recorded requests — including per-request protocol timing phases, TLS/SSL certificate details when the connection exposes them, and failure reasons:

```json
{
  "action": "get_telemetry",
  "pattern": "*api/*"
}
```

An optional `pattern` filters the returned requests by URL. The response includes:

```json
{
  "success": true,
  "count": 12,
  "requests": [
    {
      "url": "https://weavetab.dev/api/v1/session",
      "timing": { "dnsMs": 1.4, "tcpMs": 3.2, "sslMs": 4.1, "ttfbMs": 12.8 }
    }
  ],
  "navigationOccurred": false,
  "errors": []
}
```

> Certificates and timing fields are surfaced only when the underlying connection exposes them; treat missing fields as "not reported", not "absent".

---

## 4. Clearing the Buffer (`clear_telemetry`)

Reset the capture buffer between scenarios without tearing down the session:

```json
{
  "action": "clear_telemetry"
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
  "metrics": ["vitals", "memory", "navigation"]
}
```

### Response Example:
```json
{
  "vitals": {
    "fcp": 320,
    "lcp": 780,
    "cls": 0.012,
    "inp": 45,
    "ttfb": 12
  },
  "memory": {
    "usedJSHeapSize": 44154880,
    "totalJSHeapSize": 71729152,
    "jsHeapSizeLimit": 4294705152
  }
}
```

Valid `metrics` sections: `"vitals"`, `"memory"`, `"navigation"`, `"resources"`, `"raw"`. Omit `metrics` to return all sections. Heap sizes are in **bytes**. The `"resources"` section populates `slowest_resources` (top 10 by duration).

---

## 2. Deterministic Synchronization (`browser_wait`)

> [!WARNING]
> NEVER call arbitrary fixed sleep timers (e.g. `sleep 5000`). Fixed sleeps waste user time and still fail when network latency spikes.

Always synchronize with deterministic browser conditions:

### Wait for Network Idle:
```json
{
  "for": "network",
  "timeout": 10000
}
```

### Wait for DOM Mutation Stability:
```json
{
  "for": "stable",
  "timeout": 10000
}
```

### Wait for a Specific Element to Appear:
```json
{
  "for": "element",
  "value": "[data-testid=\"checkout-complete\"]",
  "timeout": 15000
}
```


# ====================================================
# DOMAIN: DOCUMENTS
# ====================================================

# Weavetab Domain Profile: DOCUMENTS

Generated for @weavetab/skills v2.5.1


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

Or crop to a specific element by CSS selector, or to a pixel rectangle with `clip`:
```json
{
  "selector": "#pricing-table",
  "format": "jpeg",
  "quality": 80
}
```

Options: `format` (`png` default, or `jpeg`), `quality` (JPEG only), `fullPage`, `selector`, and `clip` (`{x, y, width, height}`).

---

## 2. PDF Document Generation (`browser_pdf`)

Render the current page into a print-ready PDF file:

```json
{
  "filename": "report.pdf",
  "landscape": false,
  "scale": 1.0,
  "pageRanges": "1-5",
  "margin": { "top": 0.4, "bottom": 0.4, "left": 0.4, "right": 0.4 }
}
```

Options: `filename` (defaults to `capture_<timestamp>.pdf`), `landscape`, `scale` (default 1.0), `pageRanges` (e.g. `"1-5"`, empty for all), and `margin` — either a single number in inches or a `{top,bottom,left,right}` object (default 0.4).

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
To export the raw canvas as an image, or simulate a drag/gesture path across it:
```json
{
  "ref": "w:19",
  "action": "get_image"
}
```

For drawing or selecting a region, pass `"action": "draw"` with a `points` array of `{x, y}` positions (relative to the canvas):
```json
{
  "action": "draw",
  "selector": "canvas#chart",
  "points": [ { "x": 40, "y": 10 }, { "x": 200, "y": 120 } ]
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

# Office Document Ingestion: Word, Excel, PDF & CSV Parsing

Agents frequently need to parse structured spreadsheets or corporate documents downloaded during automation runs. `browser_office` reads `.xlsx`, `.xls`, `.docx`, `.pdf`, and `.csv` content directly into JSON.

---

## 1. Two Modes: `url` and `file`

`browser_office({ action: "read" })` accepts exactly one source:

- **`url`** — fetch a document URL in-browser using the active session cookies. Ideal for authenticated downloads, SharePoint links, and Google Drive exports. The format is auto-detected from the URL path or MIME type (and magic bytes as a fallback).
- **`file`** — parse a file already present in the local downloads directory. Pass a **bare filename** only (e.g. `"report.xlsx"`); path separators are rejected.

`max_rows` (default 500) caps Excel/CSV rows; `max_chars` (default 50000) caps PDF/Word text.

Use `action: "list"` first if you don't know what files are in the downloads directory.

---

## 2. Parsing Spreadsheets (`.xlsx`, `.xls`, `.csv`)

```json
{
  "action": "read",
  "file": "quarterly_revenue.xlsx",
  "max_rows": 100
}
```

Excel returns per-sheet tables (rows as objects keyed by header):

```json
{
  "success": true,
  "source": "quarterly_revenue.xlsx",
  "type": "excel",
  "data": {
    "Q3_Summary": [
      { "Department": "Engineering", "Budget": 1250000, "Actual": 1180000 },
      { "Department": "Marketing", "Budget": 600000, "Actual": 620000 }
    ]
  },
  "truncated": false
}
```

CSV returns `type: "csv"` with a flat `data` array of row objects.

---

## 3. Ingesting Word & PDF Documents (`.docx`, `.pdf`)

Word and PDF extraction return text in `content` (truncated by `max_chars`). PDF additionally reports page metadata under `data`:

```json
{
  "action": "read",
  "url": "https://intranet.example.com/docs/service_agreement.pdf"
}
```

```json
{
  "success": true,
  "source": "https://intranet.example.com/docs/service_agreement.pdf",
  "type": "pdf",
  "content": "SERVICE AGREEMENT ...",
  "truncated": true,
  "data": { "numpages": 12, "info": { "Title": "Service Agreement" } }
}
```

### Operational Notes:
- PDF/Word parsing relies on local binary dependencies (e.g. poppler); if unavailable the call returns `success: false` with an explanatory `error`.
- If the URL resolves to an HTML login page rather than a document, `type` is `"html"` and `success` is `false` — the link is likely gated.
- Never point `browser_scrape` or `browser_map` at binary documents; they cannot read inside Excel, Word, or PDF files.


# ====================================================
# DOMAIN: DEVELOPER
# ====================================================

# Weavetab Domain Profile: DEVELOPER

Generated for @weavetab/skills v2.5.1


## github-forensics

# GitHub Forensics & Repository Architecture Inspection

Navigating GitHub repositories via web browsing burns massive token budgets loading HTML chrome, comment threads, and diff trees. The official `@weavetab/plugin-github` plugin provides a dedicated `github` tool that talks to the GitHub REST API and raw content endpoints directly — no browser DOM, no cloning.

Responses are cached on disk (`~/.weavetab-system/github_cache`) and subject to GitHub's API rate limits.

---

## 1. High-Level Repository Analysis (action: "analyze")

Fetches repo metadata, the default branch, a flat recursive file tree, and a README snippet (first 100 lines). Results are cached and reused by `read`:

```json
{
  "action": "analyze",
  "repo": "Weavetab/MCP"
}
```

Returns fields such as `owner`, `repo`, `default_branch`, `description`, `language`, `file_tree` (array of `{path, type, size, sha}`), and `readme_snippet`.

If `repo` is omitted, the active tab's repository is used.

---

## 2. Reading Repository Source Files (action: "read")

Stream specific files from a public or authenticated repo via `raw.githubusercontent.com`. Requires a prior `analyze` (to cache the default branch and tree), or it will run one automatically:

```json
{
  "action": "read",
  "repo": "Weavetab/MCP",
  "paths": ["src/server.ts"],
  "line_range": [1, 200]
}
```

`paths` is relative to the repo root; `line_range` is an optional `[start, end]` (1-indexed).

---

## 3. Pull Request Forensics (action: "pr")

Retrieve PR details, changed files, and review comments:

```json
{
  "action": "pr",
  "repo": "Weavetab/MCP",
  "number": 42
}
```

Passing `number` fetches that PR; omitting it lists recent PRs.

---

## 4. Issue Triage & Search (action: "issues")

Query the issue tracker with state, label, keyword, and limit filters:

```json
{
  "action": "issues",
  "repo": "Weavetab/MCP",
  "state": "open",
  "labels": ["bug"],
  "limit": 5
}
```

- **`number`** fetches a single issue plus its comments.
- **`search`** runs a keyword search across issues.
- **`state`** (`open`/`closed`/`all`) and **`labels`** filter the listing; `limit` caps results (default 5).

> The GitHub **search** API is rate-limited more aggressively than raw/GET reads. `read` and `analyze` file fetches do not consume search-quota calls. If a call fails with a rate-limit message, wait until the reported reset time before retrying.
