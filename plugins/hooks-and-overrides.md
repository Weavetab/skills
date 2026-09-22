---
id: hooks-and-overrides
domain: plugins
triggers:
  - "plugin hooks"
  - "before tool call"
  - "after tool call"
  - "telemetry interception"
  - "sdk hooks"
tools:
  - "list_plugins"
weavetab: ">=2.5.0-beta.4"
---

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
