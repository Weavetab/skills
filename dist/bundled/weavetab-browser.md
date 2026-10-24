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
