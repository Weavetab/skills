# Weavetab Domain Profile: PLUGINS

Generated for @weavetab/skills v2.5.1


## hooks-and-overrides

# Plugin Hooks & Lifecycle Overrides

Plugins built with `@weavetab/sdk` register lifecycle hooks that run before and after tool executions. Understanding these hooks helps agents interpret custom tool behavior and blocked actions.

---

## 1. Supported Plugin Hooks

The `PluginHooks` interface exposes three primary interceptors (with backwards-compatible aliases):

1. **`onBeforeAction(handler)`** — *alias:* `beforeToolCall`
   - `handler(tool, args, session)` runs **before** any tool executes.
   - It may return a modified `args` object (replacing the arguments) or `{ __blocked: true, reason }` to abort the call.
   - Typical uses: argument validation, tenant/header injection, proxy routing.
2. **`onAfterAction(handler)`** — *alias:* `afterToolCall`
   - `handler(tool, result, session, args)` runs **after** a tool completes.
   - Its return value replaces the tool result — used for telemetry, timing, or enriching output.
3. **`onDOMMutation(handler)`** — *alias:* `onPageNavigate`
   - `handler(delta, session)` observes real-time DOM mutation / action deltas (added, removed, and changed elements, `significantChange`, `stable_count`).

---

## 2. Agent Operational Awareness

- A blocked action surfaces as a normal tool error (the server turns `__blocked` into an error result). If a plugin blocks a tool you expected to succeed, do not retry it blindly — report the block reason and pick another approach.
- An `onAfterAction` handler can rewrite a tool's result. Treat the returned payload as authoritative, not a fixed schema.
- Plugins never inject plaintext secrets into results; the Redaction Layer runs on all error output (`SessionSecretTracker.redactAll`).


## plugin-runtime

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
