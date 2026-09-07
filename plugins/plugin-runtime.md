---
id: plugin-runtime
domain: plugins
triggers:
  - "list plugins"
  - "load plugin"
  - "install plugin"
  - "weavetab plugin"
  - "extend mcp"
tools:
  - "list_plugins"
  - "load_plugin"
weavetab: ">=2.5.0-beta.3"
---

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
