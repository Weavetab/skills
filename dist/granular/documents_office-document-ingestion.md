---
id: office-document-ingestion
domain: documents
triggers:
  - "read excel"
  - "read docx"
  - "parse csv"
  - "spreadsheet"
  - "word document"
  - "parse table"
tools:
  - "browser_office"
weavetab: ">=2.5.0"
---

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
