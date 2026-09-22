---
id: session-time-travel
domain: resilience
triggers:
  - "time travel"
  - "browser checkpoint"
  - "rollback session"
  - "save state"
  - "restore cookies"
tools:
  - "browser_checkpoint"
  - "browser_cookies"
  - "browser_storage"
weavetab: ">=2.5.0-beta.4"
---

# Session Time-Travel & Instant State Rollback

In complex multi-step workflows (e.g. checkout funnels, multi-page configuration wizards, onboarding questionnaires), an error at Step 7 traditionally forces an agent to reload the root URL, re-authenticate, and waste 10+ turns repeating steps.

`browser_checkpoint` enables instantaneous time-travel by snapshotting and restoring complete browser session state.

---

## 1. What a Checkpoint Captures

A single named checkpoint atomically preserves:
- **Cookies**: Full domain cookies including `HttpOnly`, `Secure`, and `SameSite` flags.
- **Web Storage**: Entire `localStorage` and `sessionStorage` key-value maps.
- **Navigation State**: Exact page URL, scroll positions (`x`, `y`), and page title.

---

## 2. Checkpoint Operations

### A. Saving a Checkpoint (`save`)
Create a checkpoint right before undertaking risky, branching, or destructive actions:

```json
{
  "action": "save",
  "name": "pre_checkout_authenticated"
}
```

### B. Restoring a Checkpoint (`restore`)
If a downstream step errors out, times out, or hits an invalid state, roll back immediately:

```json
{
  "action": "restore",
  "name": "pre_checkout_authenticated"
}
```
*Latency: ~15ms*. The page navigates back to the checkpoint URL with cookies and storage atomically injected.

### C. Listing Checkpoints (`list`)
Inspect all active checkpoints for the current page target:

```json
{
  "action": "list"
}
```

### D. Cleaning Up (`delete`)
Free memory once a workflow has concluded:

```json
{
  "action": "delete",
  "name": "pre_checkout_authenticated"
}
```

---

## 3. High-Leverage Agent Pattern

```
1. Authenticate to Target Portal
2. browser_checkpoint({ action: "save", name: "auth_ready" })
3. Attempt automated action sequence (e.g. form filling or testing)
4. IF error occurs:
     browser_checkpoint({ action: "restore", name: "auth_ready" })
     -> Agent is immediately back at authenticated state without re-login!
```

---

## 4. Fine-Grained Cookie Management (`browser_cookies`)

Inspect, set, or delete individual browser session cookies without restoring an entire checkpoint:

```json
{
  "action": "get",
  "urls": ["https://example.com"]
}
```

Or inject an authentication cookie:
```json
{
  "action": "set",
  "cookies": [
    {
      "name": "session_token",
      "value": "xyz123",
      "domain": "example.com",
      "httpOnly": true,
      "secure": true
    }
  ]
}
```

---

## 5. Web Storage Inspection & Injection (`browser_storage`)

Query or clear `localStorage` and `sessionStorage` keys:

```json
{
  "storageType": "localStorage",
  "action": "get",
  "key": "authToken"
}
```

