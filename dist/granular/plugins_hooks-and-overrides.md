---
id: hooks-and-overrides
domain: plugins
triggers:
  - "plugin hooks"
  - "before tool call"
  - "after tool call"
  - "telemetry interception"
  - "sdk hooks"
tools: []
weavetab: ">=2.5.0"
---

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
