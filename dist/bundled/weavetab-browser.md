# Weavetab Domain Profile: BROWSER

Generated for @weavetab/skills v2.5.0-beta.3


## dom-strategy

# DOM Strategy & Token Conservation Engine

When parsing modern web applications, naive DOM dumps can consume 50,000+ tokens and cause agent degradation. Weavetab provides a high-efficiency 3-tier reading architecture.

---

## 1. The 3-Tier Reading Filter

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

---

## 2. Volatile Ref ID Navigation (`w:NN`)

Weavetab maps interactive elements to ephemeral handles in the format `w:NN` (e.g. `w:12`, `w:45`).

### Operational Rules:
1. **Never Construct Speculative CSS Selectors**: If a button has ref `w:14`, pass `"ref": "w:14"` directly to downstream action tools (`browser_click`, `browser_fill`, `browser_type`).
2. **Lifespan of Ref IDs**: Ref IDs are invalidated whenever the page navigates (`browser_navigate`), reloads, or undergoes heavy SPA re-renders. 
3. **Recovery on Invalidation**: If a tool returns `STALE_ELEMENT_REFERENCE`, do NOT guess a CSS path. Execute a targeted `browser_find` or `browser_map(lite: true)` to refresh active handles.


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

## 9. Visual Element Highlighting (`browser_highlight`)

Highlight target nodes in the live browser overlay for user transparency and debugging:

```json
{
  "ref": "w:22",
  "color": "rgba(0, 150, 255, 0.4)",
  "durationMs": 1500
}
```

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
