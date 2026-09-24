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
  - "browser_eval"
weavetab: ">=2.5.0-beta.4"
---

# DOM Strategy & Token Conservation Engine

When parsing modern web applications, naive DOM dumps can consume 50,000+ tokens and cause agent degradation. Weavetab provides a high-efficiency 4-tier reading architecture.

---

## 1. The 4-Tier Reading Filter

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
                                                          │
                                     [Sparse / Canvas / WebGL / <5 elements?]
                                                          │
                                                          ▼
                                                    `browser_map`
                                                  (visual: "auto")
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

### Tier 4: Set-of-Marks Visual Grounding (`browser_map` with `visual: "auto"`)
Use when target pages are canvas-heavy, WebGL, Figma, Google Sheets, or when standard `browser_map` returns < 5 interactive elements.
- Injects temporary numbered badges `[1]…[N]` over interactive elements & canvas regions.
- Captures an annotated screenshot + returns a structured mark list.
- **Zero Page Pollution**: Strips badges immediately after capture.
- **Action**: Pass `"mark": N` to `browser_click` to click the exact element without re-scanning the DOM.

```json
{
  "visual": "auto"
}
```

### Tier 5: Runtime State & JavaScript Evaluation (`browser_eval`)
When DOM nodes are occluded or you need direct access to in-memory window state (e.g. Redux store, localStorage keys, or complex canvas dimensions), use `browser_eval` as an escape hatch:
```json
{
  "expression": "window.__INITIAL_STATE__ || document.title"
}
```

---

## 2. Volatile Ref ID & Visual Mark Navigation

Weavetab maps elements to ephemeral handles (`w:NN`) and visual marks (`[1]…[N]`):

### Operational Rules:
1. **Never Construct Speculative CSS Selectors**: If an element has ref `w:14`, pass `"ref": "w:14"` to `browser_click`, `browser_fill`, `browser_type`.
2. **Visual Mark Targeting**: On canvas or unlabelled elements from `visual: "auto"`, pass `"mark": N` directly to `browser_click({ mark: N })`.
3. **Lifespan of Handles**: Ref IDs and marks invalidate on page navigation (`browser_navigate`) or heavy SPA re-renders. 
4. **Recovery on Invalidation**: If an action fails with `ELEMENT_NOT_FOUND` or `MARK_NOT_FOUND`, re-run `browser_map({ visual: "auto" })` to refresh active handles.
