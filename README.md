# Weavetab MCP Skills (`@weavetab/skills`)

[![npm version](https://img.shields.io/npm/v/@weavetab/skills.svg)](https://www.npmjs.com/package/@weavetab/skills)
[![GitHub stars](https://img.shields.io/github/stars/Weavetab/skills.svg?style=social)](https://github.com/Weavetab/skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Enterprise domain-driven agent intelligence for `@weavetab/mcp` (v2.5.0-beta.4). Drop-in operational guides, failure recovery heuristics, and protocol rules for **Antigravity**, **Cursor**, **Cline**, **Windsurf**, and **OpenClaw**.

- **Website:** [weavetab.pages.dev](https://weavetab.pages.dev)
- **Core MCP Server:** [`@weavetab/mcp`](https://www.npmjs.com/package/@weavetab/mcp)
- **Plugin SDK:** [`@weavetab/sdk`](https://www.npmjs.com/package/@weavetab/sdk)

---

## 1. Architectural Philosophy: The Step-0 Router

Rather than forcing LLMs to read dozens of flat files or guess between vague difficulty tiers, `@weavetab/skills` provides a deterministic Step-0 decision engine via [`ROUTER.md`](ROUTER.md). 

Agents classify their immediate intent in one turn and jump directly to the target domain guide:

```
@weavetab/skills/
├── ROUTER.md                   # Universal Intent Decision Matrix (Step-0)
├── browser/                    # Web & Chromium DOM Navigation Engine
├── desktop/                    # Native Desktop & Electron Application Automation
├── memory/                     # Cross-Session Adaptive Selector Learning & History
├── resilience/                 # Time-Travel Checkpoints, Stale Refs, Loops & Captchas
├── security/                   # Zero-Leak Secret Containment & RBAC Guardrails
├── plugins/                    # Dynamic Extension Loading, Hooks & Custom Tools
├── network-and-perf/           # TLS Forensics, Interception, Core Web Vitals & Emulation
├── documents/                  # Word, Excel, CSV, PDF & Canvas Ingestion
├── developer/                  # GitHub Local Clone & API Repository Forensics
├── evals/                      # Executable Agent Evaluation & Benchmark Harness
├── dist/                       # Compiled targets (granular + bundled domain profiles)
├── bin/cli.js                  # Interactive Multi-Agent Installer
└── src/api.js                  # Programmatic Framework Generator & Adapter Engine
```

---

## 2. The 9 Operational Domains & 44-Tool Matrix

Every single one of the **44 official tools** in `@weavetab/mcp` is documented with verified parameters and runtime patterns:

| Domain | Primary Tools | Operational Capabilities |
| :--- | :--- | :--- |
| **`browser/`** | `browser_map`, `browser_find`, `browser_click`, `browser_type`, `browser_fill`, `browser_key`, `browser_pointer`, `browser_upload`, `browser_tabs`, `browser_scroll`, `browser_dialog`, `browser_burst`, `browser_highlight`, `browser_clipboard` | Token-conserving DOM walks (`lite: true`), volatile `w:NN` handles, atomic multi-field inputs, OS file upload bypass. |
| **`desktop/`** | `browser_detect`, any tool with `app` argument | Zero-terminal scanning for Slack, Discord, VS Code, Notion, Obsidian; routing actions directly to native Electron windows. |
| **`memory/`** | `browser_pattern_learn`, `browser_thoughts`, `browser_automation`, `browser_recording` | Cross-session origin selector decay, compiling manual interaction trails into deterministic macros via `browser_burst`. |
| **`resilience/`**| `browser_checkpoint`, `browser_cookies`, `browser_storage`, `browser_captcha` | Time-travel state snapshots (`save`, `restore`) for instant rollbacks, 4-tier SPA stale ref healing, loop breaker (`browser_map`, `browser_wait`). |
| **`security/`** | `browser_type_secret`, RBAC tiers | Hardware-grade zero-bleed guarantee (passwords masked in HUD, CDP logs, and conversation transcripts). |
| **`plugins/`**  | `list_plugins`, `load_plugin` | Runtime discovery and dynamic loading of verified npm community plugins into the active MCP session. |
| **`network-and-perf/`** | `browser_network_intercept`, `browser_performance`, `browser_wait`, `browser_emulate` | API mocking, TLS certificate chain audits, Core Web Vitals (LCP/CLS), device presets & 3G throttling. |
| **`documents/`**| `browser_office`, `browser_pdf`, `browser_canvas`, `browser_screenshot`, `browser_viewport`, `browser_extract_design` | Ingesting Excel spreadsheets, Word `.docx`, and CSVs into structured JSON; full-page screenshots and canvas inspection. |
| **`developer/`**| `browser_github` | Sub-millisecond local repo inspection, PR diffs, and issue triage without burning browser turns. |

---

## 3. Interactive Installation

Inject formatted skills and rules directly into your AI agent environment:

```bash
npx @weavetab/skills
```

The interactive installer prompts you for:
1. **Domain Scope**: Full Enterprise Suite (All 9 Domains), Web Core, Desktop, Resilience, or Forensics.
2. **Target Agent Framework**:
   - **Antigravity**: Generates `.agent/skills/weavetab-<domain>/SKILL.md` with standard YAML frontmatter.
   - **Cursor**: Generates `.cursor/rules/weavetab-<domain>.mdc` with MDC frontmatter.
   - **Cline**: Appends formatted sections to `.clinerules`.
   - **Windsurf**: Generates `.windsurf/rules/weavetab-<domain>.md`.
   - **OpenClaw & RooCode**: Generates respective agent rules.
   - **Raw Markdown**: Generates portable `weavetab-skills/`.

---

## 4. Programmatic API

Install skills programmatically from setup scripts or custom CLIs:

```javascript
const { installSkills, getSkills, getSkill, getRouterMatrix } = require('@weavetab/skills');

// Install targeted domains into Cursor
await installSkills({
  targetFramework: '.cursor',
  domains: ['browser', 'resilience', 'security']
});

// Query skills catalog
const webSkills = getSkillsByDomain('browser');
```

---

## 5. Automated Benchmark & Evaluation Suite (`evals/`)

Run the automated evaluation harness to verify that all 48 tools are covered and that skill guidance strictly passes test scenarios without legacy hallucinations:

```bash
npm test
```

---

*Built with precision for the Weavetab Ecosystem.*
