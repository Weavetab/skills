---
id: plugin-runtime
domain: plugins
triggers:
  - "what plugins are installed"
  - "weavetab plugin"
  - "weavetab plugin use"
  - "weavetab plugin update"
  - "extend mcp"
  - "plugin tools"
  - "plugin commands"
  - "plugin prompts"
  - "plugin resources"
  - "plugin permissions"
tools: [browser_snapshot]
weavetab: ">=2.6.3"
---

# Plugin Runtime: Weavetab Plugin Architecture

Weavetab features an extensible plugin architecture powered by `@weavetab/sdk`. Installed plugins can expose:
1. **MCP Tools (`tools`)** — callable directly as MCP tools alongside core tools like `browser_snapshot`.
2. **CLI Commands (`commands`)** — callable from the terminal via `weavetab plugin use <pkg> <command> [--flags]`.
3. **Prompts (`prompts`) & Resources (`resources`)** — `/` **Prompts** (reusable prompt templates) and `@` **Resources** (live context URIs).
4. **Agent Instructions (`instructions`)** — a strictly bounded (`<= 80` lines, `<= 3,200` chars) field in `weavetab.json` teaching AI agents how to use the plugin's tools, CLI commands, prompts, and resources without bloating context.

---

## 1. Discovering, Running & Updating Plugins (MCP & CLI)

Connected AI agents can inspect all installed plugins, their tools, CLI commands, prompts, resources, and operational instructions at any time. When coordinating custom plugin actions with page state, use `browser_snapshot` to capture or verify DOM nodes before and after plugin execution:

- **MCP Resources**:
  - Read `weavetab://plugins` for a JSON catalog of all installed plugins (tools, commands, `/prompts`, and `@resources`).
  - Read `weavetab://plugins/<name>/instructions` to read a plugin's bounded operational instructions.
- **CLI Execution (`weavetab plugin`)**:
  ```bash
  # Inspect a plugin's commands, tools, prompts, and resources
  weavetab plugin use github

  # Run a plugin CLI command
  weavetab plugin use github repo-summary --repo Weavetab/Weavetab

  # Read operational instructions and CLI flag schemas for an installed plugin
  weavetab plugin use github instructions

  # Interactively upgrade an installed plugin to a newer published version
  weavetab plugin update github
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
| `prompts.add: true` | Plugin can register `/` Prompts (`definePrompt`) |
| `resources.add: true` | Plugin can register `@` Resources (`defineResource`) |
| `hooks.onBeforeAction: true` | Plugin can intercept all tool calls before execution |
| `hooks.onAfterAction: true` | Plugin can inspect/transform all tool results |

Plugins that attempt to register tools, CLI commands, prompts, or resources without declaring the corresponding permission (`tools.add`, `commands.add`, `prompts.add`, `resources.add`) are blocked by both `@weavetab/mcp` at runtime and `@weavetab/sdk` during `weavetab build` / `weavetab preflight` / `weavetab publish`.

---

## 3. Strict `instructions` Budget Enforcement

To prevent third-party plugins from exploding an AI agent's context window, `@weavetab/sdk` enforces hard limits on `instructions` in `weavetab.json` during `weavetab build`, `weavetab validate`, `weavetab preflight`, `weavetab doctor`, and `weavetab publish`:
- **Maximum Lines**: `80` lines
- **Maximum Characters**: `3,200` characters (`~800` tokens)

Any plugin exceeding these limits is rejected before it can be built or published to npm, and the MCP runtime also clamps `instructions` at load time as defense-in-depth.

---

## 4. Trust Tiers

| Tier | Badge | Condition |
|---|---|---|
| Official | `✚ [Official]` | `@weavetab/plugin-*` packages |
| Verified | `✔ [Verified]` | Listed in the Weavetab verified registry |
| Unverified | `⚠ [Unverified]` | Unknown community package |
