---
id: interaction-pipeline
domain: browser
triggers:
  - "click element"
  - "type text"
  - "press key"
  - "drag and drop"
  - "hover"
  - "upload file"
tools:
  - "browser_click"
  - "browser_type"
  - "browser_key"
  - "browser_pointer"
  - "browser_upload"
  - "browser_scroll"
  - "browser_dialog"
  - "browser_burst"
  - "browser_highlight"
  - "browser_clipboard"
weavetab: ">=2.5.0"
---

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

