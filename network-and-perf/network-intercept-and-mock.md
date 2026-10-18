---
id: network-intercept-and-mock
domain: network-and-perf
triggers:
  - "mock api"
  - "intercept network"
  - "stub request"
  - "inspect tls"
  - "ssl certificate"
  - "network waterfall"
tools:
  - "browser_network_intercept"
weavetab: ">=2.5.0"
---

# Network Interception, Mocking & Telemetry

Autonomous testing and debugging often require simulating backend error states (e.g. 500 Internal Server Error, 429 Rate Limit), stubbing third-party analytics, or inspecting real request timing and TLS metadata.

`browser_network_intercept` exposes four actions: `enable`, `disable`, `get_telemetry`, and `clear_telemetry`.

---

## 1. Mocking API Responses (`enable`)

`enable` requires a `pattern` (URL glob). Every matching response is fulfilled with your mock:

```json
{
  "action": "enable",
  "pattern": "*/api/v1/user/profile",
  "mockStatus": 200,
  "mockBody": "{\"id\": \"usr_test\", \"role\": \"admin\", \"credits\": 9999}"
}
```

- **`pattern`** — URL glob, e.g. `*api/users*`. `*` and `?` are treated as wildcards.
- **`mockStatus`** — HTTP status to return (default `200`). Use `500`/`429`/`404` to simulate failures.
- **`mockBody`** — response body string (default `{}`). Pass JSON as a string.

Mocks are served from the extension when present, otherwise via CDP's Fetch domain (fallback mode).

---

## 2. Stopping Interception (`disable`)

Return the browser to live traffic when a test completes:

```json
{
  "action": "disable"
}
```

---

## 3. Network Telemetry (`get_telemetry`)

`get_telemetry` starts a background capture (if not already running) and returns the recorded requests — including per-request protocol timing phases, TLS/SSL certificate details when the connection exposes them, and failure reasons:

```json
{
  "action": "get_telemetry",
  "pattern": "*api/*"
}
```

An optional `pattern` filters the returned requests by URL. The response includes:

```json
{
  "success": true,
  "count": 12,
  "requests": [
    {
      "url": "https://weavetab.dev/api/v1/session",
      "timing": { "dnsMs": 1.4, "tcpMs": 3.2, "sslMs": 4.1, "ttfbMs": 12.8 }
    }
  ],
  "navigationOccurred": false,
  "errors": []
}
```

> Certificates and timing fields are surfaced only when the underlying connection exposes them; treat missing fields as "not reported", not "absent".

---

## 4. Clearing the Buffer (`clear_telemetry`)

Reset the capture buffer between scenarios without tearing down the session:

```json
{
  "action": "clear_telemetry"
}
```
