# Weavetab Domain Profile: PLUGINS

Generated for @weavetab/skills v2.5.0-beta.5


## hooks-and-overrides

# Plugin Hooks & Lifecycle Overrides

Plugins built with `@weavetab/sdk` register lifecycle hooks that run before and after tool executions. Understanding these hooks helps agents interpret metadata and custom tool responses.

---

## 1. Supported Plugin Hooks

1. **`beforeToolCall(toolName, args)`**:
   - Validates arguments against custom enterprise schemas.
   - Injects tenant IDs, authentication headers, or proxy routing.
2. **`afterToolCall(toolName, result, durationMs)`**:
   - Emits OpenTelemetry metrics and timing waterfalls to external APM platforms.
   - Enriches return objects with contextual metadata.
3. **`onNavigate(url, targetId)`**:
   - Triggers automated cookie injection or session setup upon page navigation.

---

## 2. Agent Operational Awareness

When plugins are active, tool return payloads may include an optional `_pluginMetadata` object containing trace IDs, custom metrics, or security audit timestamps. Agents should treat this object as informational telemetry.


## plugin-runtime

# Plugin Runtime: Weavetab Plugin Architecture

Weavetab features an extensible plugin architecture powered by `@weavetab/sdk`. All installed plugins are loaded automatically at server startup — their tools appear directly in the MCP tool list alongside built-in tools. Agents never need to discover or activate plugins manually.

---

## 1. How Plugin Tools Appear

Plugin tools are first-class MCP tools. If `@weavetab/plugin-recaptcha-solver` is installed, `captcha_solve_token` appears in the tool list immediately on startup — no discovery step needed.

There are **no** `list_plugins` or `load_plugin` tools. Managing plugins is a CLI operation:

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
