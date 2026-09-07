---
id: dom-strategy
domain: browser
triggers:
  - "read page"
  - "inspect dom"
  - "find element"
  - "parse webpage"
  - "locate button"
  - "extract text"
tools:
  - "browser_map"
  - "browser_find"
  - "browser_scrape"
  - "browser_snapshot"
weavetab: ">=2.5.0-beta.3"
---

# DOM Strategy & Token Conservation Engine

When parsing modern web applications, naive DOM dumps can consume 50,000+ tokens and cause agent degradation. Weavetab provides a high-efficiency 3-tier reading architecture.

---

## 1. The 3-Tier Reading Filter

Always select the narrowest tool that satisfies your immediate objective:

```
                  ┌───────────────────────────────┐
                  │ Do you need full structural   │
                  │ context or just a target?     │
                  └──────────────┬────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [Specific Target]                 [Whole Document]
                 │                               │
        ┌────────┴────────┐              ┌───────┴────────┐
        ▼                 ▼              ▼                ▼
  Target by text   Target by role   Read articles     Interactive
   or keywords      or hierarchy     or prose data     UI layout
        │                 │              │                │
        ▼                 ▼              ▼                ▼
  `browser_find`   `browser_map`   `browser_scrape`  `browser_map`
                   (lite: true)                      (lite: true)
```

### Tier 1: Targeted Keyword Jump (`browser_find`)
Use `browser_find` when you already know the label, text snippet, placeholder, or aria-label of the target element.
- **Latency**: Sub-5ms CDP search.
- **Token Cost**: ~50–100 tokens (returns only matching candidate nodes).

```json
{
  "query": "Sign In",
  "matchType": "contains",
  "visibleOnly": true
}
```

### Tier 2: Token-Optimized DOM Walk (`browser_map` with `lite: true`)
Use `browser_map` when you must understand the interactive structure of the page.
- **Rule**: ALWAYS pass `"lite": true` unless you strictly need deeply nested non-interactive DOM trees.
- **Efficiency**: Strips decorative wrappers, SVG paths, hidden containers, and scripts. Reduces payload by **85% to 95%**.
- **Viewport Filtering**: Set `"includeOffscreen": false` to only inspect elements currently visible in the active viewport.

```json
{
  "lite": true,
  "includeOffscreen": false,
  "maxDepth": 6
}
```

### Tier 3: Markdown Prose & Data Ingestion (`browser_scrape`)
Use `browser_scrape` when your objective is reading articles, blog posts, documentation, or legal terms rather than clicking buttons.
- Converts HTML to clean, semantically structured Markdown.
- Automatically handles readability filtering and removes advertising/cookie banners.

---

## 2. Volatile Ref ID Navigation (`w:NN`)

Weavetab maps interactive elements to ephemeral handles in the format `w:NN` (e.g. `w:12`, `w:45`).

### Operational Rules:
1. **Never Construct Speculative CSS Selectors**: If a button has ref `w:14`, pass `"ref": "w:14"` directly to downstream action tools (`browser_click`, `browser_fill`, `browser_type`).
2. **Lifespan of Ref IDs**: Ref IDs are invalidated whenever the page navigates (`browser_navigate`), reloads, or undergoes heavy SPA re-renders. 
3. **Recovery on Invalidation**: If a tool returns `STALE_ELEMENT_REFERENCE`, do NOT guess a CSS path. Execute a targeted `browser_find` or `browser_map(lite: true)` to refresh active handles.
