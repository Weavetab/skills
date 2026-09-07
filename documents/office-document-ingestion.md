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
weavetab: ">=2.5.0-beta.3"
---

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
