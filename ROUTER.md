# Weavetab Agent Intent Decision Matrix (Step-0 Router)

Welcome to the **Weavetab MCP Skills Routing Engine**. 

When executing browser or desktop automation via `@weavetab/mcp`, **do not read the entire skills directory**. Match your immediate intent against the matrix below and jump directly to the target domain guide.

---

## Intent Routing Table

| If your objective is... | Read Domain Guide | Primary MCP Tools |
| :--- | :--- | :--- |
| **Inspect DOM, extract text, locate elements, save tokens** | [`browser/dom-strategy.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/browser/dom-strategy.md) | `browser_map`, `browser_find`, `browser_scrape`, `browser_snapshot` |
| **Click, type, press keys, pointer trajectories, file upload** | [`browser/interaction-pipeline.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/browser/interaction-pipeline.md) | `browser_click`, `browser_type`, `browser_key`, `browser_pointer`, `browser_upload` |
| **Fill multi-field forms, select dropdowns, checkboxes** | [`browser/form-automation.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/browser/form-automation.md) | `browser_fill`, `browser_select` |
| **Manage tabs, window creation, tab crash recovery** | [`browser/tab-and-window.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/browser/tab-and-window.md) | `browser_tabs` |
| **Discover running Electron apps (Slack, Discord, VS Code)** | [`desktop/electron-discovery.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/desktop/electron-discovery.md) | `browser_detect` |
| **Control native desktop applications with MCP tools** | [`desktop/desktop-targeting.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/desktop/desktop-targeting.md) | Any tool passing `app: "<name>"` |
| **Bypass DOM walks using learned & cached selectors** | [`memory/selector-memory-system.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/memory/selector-memory-system.md) | Telemetry & selector history |
| **Recall multi-step site workflows, quirks & fast-path replay** | [`memory/site-learning.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/memory/site-learning.md) | `browser_memory_profile`, `browser_pattern_learn` |
| **Compile manual action history into reusable macros** | [`memory/session-trail.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/memory/session-trail.md) | `browser_macro_compile` |
| **Handle React/Next/Vue detached elements & re-renders** | [`resilience/stale-ref-recovery.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/resilience/stale-ref-recovery.md) | 4-tier auto-recovery heuristic |
| **Save/restore checkpoints & rollback failed workflows** | [`resilience/session-time-travel.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/resilience/session-time-travel.md) | `browser_checkpoint` |
| **Break infinite interaction loops or handle CAPTCHAs** | [`resilience/loop-breaker.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/resilience/loop-breaker.md) | `browser_reset_loop_counter`, `browser_captcha` |
| **Enter passwords, API keys, or sensitive credentials** | [`security/secret-containment-protocol.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/security/secret-containment-protocol.md) | `browser_type_secret` |
| **Enforce RBAC boundaries & sandbox viewer agents** | [`security/rbac-and-policies.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/security/rbac-and-policies.md) | RBAC security layer |
| **Discover & dynamically load community plugins** | [`plugins/plugin-runtime.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/plugins/plugin-runtime.md) | `list_plugins`, `load_plugin` |
| **Intercept tool execution pipelines via SDK hooks** | [`plugins/hooks-and-overrides.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/plugins/hooks-and-overrides.md) | SDK Plugin Hooks |
| **Mock API endpoints, stub tracking, analyze TLS certs** | [`network-and-perf/network-intercept-and-mock.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/network-and-perf/network-intercept-and-mock.md) | `browser_network_intercept` |
| **Measure Core Web Vitals (LCP, CLS) & wait conditions** | [`network-and-perf/performance-and-vitals.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/network-and-perf/performance-and-vitals.md) | `browser_performance`, `browser_wait` |
| **Emulate mobile devices, CPU throttle, mock location** | [`network-and-perf/device-and-environment.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/network-and-perf/device-and-environment.md) | `browser_emulate` |
| **Ingest Word (.docx), Excel (.xlsx), CSV files** | [`documents/office-document-ingestion.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/documents/office-document-ingestion.md) | `browser_office` |
| **Capture screenshots, PDF exports, canvas pixels & visual marks** | [`documents/canvas-and-visual-capture.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/documents/canvas-and-visual-capture.md) | `browser_screenshot`, `browser_canvas`, `browser_pdf`, `browser_map` |
| **Sub-ms local Git repo parsing & PR/issue triage** | [`developer/github-forensics.md`](file:///c:/Users/fy2ne/Music/Weavetab/skills/developer/github-forensics.md) | `github_analyze`, `github_read`, `github_get_pr`, `github_issues` |

---

## The 4 Golden Operational Rules for Weavetab Agents

1. **Environment Handshake First**: Always call `browser_detect` at the start of a session to discover available browsers and configured desktop apps (Discord, Slack, etc.) and check their live connection status (`connected`, `running_no_debug`, `offline`).
2. **Token Conservation**: NEVER call `browser_map` on large modern web apps without `lite: true` unless you strictly require full hierarchy data. For keyword navigation, always prefer `browser_find`.
3. **Volatile Handle Discipline**: Always use the returned volatile ref IDs (`w:NN`) directly. Do NOT attempt to construct speculative CSS selectors from scratch.
4. **Zero Secret Leakage**: Pass all authentication credentials, API keys, and sensitive tokens through `browser_type_secret`. Never use `browser_type` or `browser_fill` for credentials.
