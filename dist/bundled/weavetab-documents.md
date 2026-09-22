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
