# Weavetab Domain Profile: PLUGINS

Generated for @weavetab/skills v2.5.0-beta.4


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

# Plugin Runtime: Dynamic Extension Loading

Weavetab features an extensible plugin architecture powered by `@weavetab/sdk`. Agents can query loaded extensions and dynamically load community or official plugins into the live MCP runtime without restarting the server.

---

## 1. Inspecting Active Plugins (`list_plugins`)

Discover all installed plugins, their versions, and the tools or hooks they expose:

```json
{}
```

### Response Example:
```json
{
  "plugins": [
    {
      "name": "@weavetab/plugin-recaptcha-solver",
      "version": "1.2.0",
      "status": "active",
      "toolsProvided": ["captcha_solve_token"],
      "hooks": ["beforeToolCall"]
    }
  ]
}
```

---

## 2. Dynamic Runtime Loading (`load_plugin`)

Load a verified plugin package into the active runtime session:

```json
{
  "name": "@weavetab/plugin-datadog-tracer"
}
```

### Plugin Verification Guarantees:
- Plugins must implement the `@weavetab/sdk` standard interface.
- Loaded tools become immediately callable by the agent in subsequent turns.
- If an agent is in the `viewer` RBAC tier, `load_plugin` is rejected with `PERMISSION_DENIED`.
