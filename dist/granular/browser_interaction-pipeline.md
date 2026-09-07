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
weavetab: ">=2.5.0-beta.3"
---

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

