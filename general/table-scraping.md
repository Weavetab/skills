---
id: table-scraping
tier: general
triggers: ["scrape table", "extract table", "table data", "csv", "rows", "columns", "spreadsheet"]
tools: ["browser_scrape", "browser_map", "browser_snapshot", "browser_navigate"]
weavetab: ">=2.5.0"
---
# 📊 Intelligent Table Scraping
**Core Philosophy:** Data rarely looks exactly how you want it to. Be a smart data extractor.

- **Identify the Target:** Tables aren't always `<table>` elements. Look for CSS grids, flexboxes, and repeating list structures.
- **Scrape Smartly:** Use `browser_scrape` to pull structured data. If the table is paginated, you have the autonomy to loop through pages and compile the data into a single comprehensive dataset.
- **Data Cleanup:** When you extract the data, don't just dump it. Clean it up. Format it nicely (e.g., Markdown tables or CSV) for the user. If headers are weird, infer what they mean and rename them.
