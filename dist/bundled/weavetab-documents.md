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
