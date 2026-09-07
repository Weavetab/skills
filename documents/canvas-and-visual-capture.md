---
id: canvas-and-visual-capture
domain: documents
triggers:
  - "take screenshot"
  - "capture viewport"
  - "export pdf"
  - "canvas inspection"
  - "extract design tokens"
tools:
  - "browser_screenshot"
  - "browser_viewport"
  - "browser_canvas"
  - "browser_pdf"
  - "browser_extract_design"
weavetab: ">=2.5.0-beta.3"
---

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

## 3. HTML5 Canvas Pixel Inspection (`browser_canvas`)

When a chart or graphic is rendered via `<canvas>`, standard DOM reading tools cannot see the contents. `browser_canvas` extracts the raw image data or inspects 2D/WebGL drawing context commands:

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
