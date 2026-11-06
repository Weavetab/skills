---
id: plugin-runtime
domain: plugins
triggers:
  - "what plugins are installed"
  - "weavetab plugin"
  - "weavetab plugin use"
  - "extend mcp"
  - "plugin tools"
  - "plugin commands"
  - "plugin utilities"
  - "plugin permissions"
tools: [browser_snapshot]
weavetab: ">=2.6.2"
---

# Plugin Runtime: Weavetab Plugin Architecture

Weavetab features an extensible plugin architecture powered by `@weavetab/sdk`. Installed plugins can expose four distinct surfaces:
1. **MCP Tools (`tools`)** — callable directly as MCP tools alongside core tools like `browser_snapshot`.
2. **CLI Commands (`commands`)** — callable from the terminal via `weavetab plugin use <pkg> <command> [--flags]`.
3. **Utilities (`prompts` & `resources`)** — `/` **Prompts** (reusable prompt templates) and `@` **Resources** (live context URIs).
4. **AI Agent Playbook (`AGENTS.md`)** — a mandatory, strictly bounded (`<= 80` lines, `<= 3200` chars) guide teaching AI agents how to use the plugin's tools, CLI commands, and utilities without bloating context.

---

## 1. Discovering & Using Plugins (MCP & CLI)

Connected AI agents can inspect all installed plugins, their tools, CLI commands, utilities, and `AGENTS.md` playbooks at any time. When coordinating custom plugin actions with page state, use `browser_snapshot` to capture or verify DOM nodes before and after plugin execution:

- **MCP Resources**:
  - Read `weavetab://plugins` for a JSON catalog of all installed plugins (tools, commands, `/prompts`, `@resources`, and `agentsResourceUri`).
  - Read `weavetab://plugins/<slug>/agents` to read a plugin's bounded `AGENTS.md` playbook.
- **CLI Execution (`weavetab plugin use`)**:
  ```bash
  # Inspect a plugin's commands, tools, utilities, and AGENTS.md
  weavetab plugin use github

  # Run a plugin CLI command
  weavetab plugin use github repo-summary --repo Weavetab/Weavetab

  # Run a plugin MCP tool from the terminal (supports --json '{...}' or --flag value)
  weavetab plugin use auth profiles

  # Read AGENTS.md playbook for one or all installed plugins
  weavetab plugin agents github
  ```

---

## 2. Plugin Permission Model

Every plugin declares what it can do in `weavetab.json`. The runtime enforces this at load time:

| Permission | What it gates |
|---|---|
| `tools.add: true` | Plugin can register new MCP tools (`defineTool`) |
| `tools.override: ["browser_navigate"]` | Plugin can wrap/replace that built-in tool |
| `tools.remove: ["browser_pdf"]` | Plugin can disable that built-in tool |
| `commands.add: true` | Plugin can register CLI commands (`defineCommand` / `weavetab plugin use`) |
| `prompts.add: true` | Plugin can register `/` Prompt utilities (`definePrompt`) |
| `resources.add: true` | Plugin can register `@` Resource utilities (`defineResource`) |
| `hooks.onBeforeAction: true` | Plugin can intercept all tool calls before execution |
| `hooks.onAfterAction: true` | Plugin can inspect/transform all tool results |

Plugins that attempt to register tools, CLI commands, prompts, or resources without declaring the corresponding permission (`tools.add`, `commands.add`, `prompts.add`, `resources.add`) are blocked by both `@weavetab/mcp` at runtime and `@weavetab/sdk` during `weavetab build` / `weavetab preflight` / `weavetab publish`.

---

## 3. Strict `AGENTS.md` Budget Enforcement

To prevent third-party plugins from exploding an AI agent's context window, `@weavetab/sdk` enforces hard limits on `AGENTS.md` during `weavetab build`, `weavetab validate`, `weavetab preflight`, `weavetab doctor`, and `weavetab publish`:
- **Maximum Lines**: `80` lines
- **Maximum Characters**: `3,200` characters (`~800` tokens)
- **Minimum Content**: `40` characters, must include a markdown heading (`#`)

Any plugin exceeding these limits is rejected before it can be built or published to npm, and the MCP runtime also clamps `AGENTS.md` at load time as defense-in-depth.

---

## 4. Trust Tiers

| Tier | Badge | Condition |
|---|---|---|
| Official | `✚ [Official]` | `@weavetab/plugin-*` packages |
| Verified | `✔ [Verified]` | Listed in the Weavetab verified registry |
| Unverified | `⚠ [Unverified]` | Unknown community package |
