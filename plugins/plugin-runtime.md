---
id: plugin-runtime
domain: plugins
triggers:
  - "what plugins are installed"
  - "weavetab plugin"
  - "extend mcp"
  - "plugin tools"
  - "plugin permissions"
tools: []
weavetab: ">=2.5.0"
---

# Plugin Runtime: Weavetab Plugin Architecture

Weavetab features an extensible plugin architecture powered by `@weavetab/sdk`. All installed plugins are loaded automatically at server startup — their tools appear directly in the MCP tool list alongside built-in tools. Agents never need to discover or activate plugins manually.

---

## 1. How Plugin Tools Appear

Plugin tools are first-class MCP tools. If `@weavetab/plugin-recaptcha-solver` is installed, `captcha_solve_token` appears in the tool list immediately on startup — alongside built-ins such as `browser_snapshot` — with no discovery step needed.

There is no MCP tool for discovering or activating plugins. Managing plugins is a CLI operation:

```bash
# Install a plugin (restart required)
weavetab plugin add @weavetab/plugin-youtube

# Remove a plugin
weavetab plugin rm @weavetab/plugin-youtube

# List installed plugins
weavetab plugin list
```

---

## 2. Plugin Permission Model

Every plugin declares what it can do in `weavetab.json`. The runtime enforces this at load time:

| Permission | What it gates |
|---|---|
| `tools.add: true` | Plugin can register new MCP tools |
| `tools.override: ["browser_navigate"]` | Plugin can wrap/replace that built-in tool |
| `tools.remove: ["browser_pdf"]` | Plugin can disable that built-in tool |
| `hooks.onBeforeAction: true` | Plugin can intercept all tool calls before execution |
| `hooks.onAfterAction: true` | Plugin can inspect/transform all tool results |

Plugins that attempt to exceed their declared permissions are blocked with a stderr warning — they do not crash.

---

## 3. Trust Tiers

| Tier | Badge | Condition |
|---|---|---|
| Official | `✚ [Official]` | `@weavetab/plugin-*` packages |
| Verified | `✔ [Verified]` | Listed in the Weavetab verified registry |
| Unverified | `⚠ [Unverified]` | Unknown community package |

Unverified plugins are loaded but their permissions are logged visibly at startup for user review.
