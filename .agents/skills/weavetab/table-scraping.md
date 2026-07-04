---
id: table-scraping
tier: general
triggers: []
tools: []
weavetab: ">=2.5.0"
---
# Table Scraping Pattern

1. **Locate**: Use `browser_map({ prune: true })` to locate the table container.
2. **Scrape**: Do not manually click through pages or read the DOM raw. Use `browser_scrape` targeting the table structure to extract row data cleanly into JSON.
3. **Pagination**: If scraping multiple pages, map the "Next" button ID once, then loop: `browser_scrape` -> `browser_click` (Next) -> verify change -> repeat.