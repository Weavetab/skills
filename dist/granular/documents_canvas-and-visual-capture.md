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
  - "browser_map"
  - "browser_click"
weavetab: ">=2.5.0"
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
