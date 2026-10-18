# Weavetab Domain Profile: NETWORK-AND-PERF

Generated for @weavetab/skills v2.5.1


## device-and-environment

# Device Emulation & Environment Simulation

Auditing mobile responsive layouts, testing geographic restrictions, and simulating degraded network conditions are split across two tools: `browser_viewport` owns device geometry, locale, timezone, and color-scheme emulation; `browser_emulate` owns network throttling and CPU slowdown.

---

## 1. Device Presets & Viewport Simulation (`browser_viewport`)

List the available hardware presets, then apply one:

```json
{ "action": "list" }
```

```json
{
  "action": "preset",
  "devicePreset": "iPhone 15 Pro"
}
```

Or configure custom screen geometry directly with `action: "set"`:

```json
{
  "action": "set",
  "width": 393,
  "height": 852,
  "deviceScaleFactor": 3,
  "mobile": true,
  "hasTouch": true,
  "screenOrientation": "portrait"
}
```

Clear all viewport and emulation overrides back to the host defaults:

```json
{ "action": "clear" }
```

---

## 2. Network & CPU Throttling (`browser_emulate`)

Verify how web applications degrade under poor connectivity:

```json
{
  "network": {
    "offline": false,
    "downloadThroughput": 512000,
    "uploadThroughput": 256000,
    "latency": 400
  },
  "cpuThrottlingRate": 4
}
```

Use a named profile for common cases (`"slow3g"`, `"fast3g"`, `"4g"`, `"offline"`, `"online"`):

```json
{ "network": "slow3g" }
```

---

## 3. Geolocation, Timezone, Locale & Color Scheme (`browser_viewport`)

Bypass localized IP redirects or verify localized content rendering:

```json
{
  "action": "set",
  "geolocation": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "accuracy": 100
  },
  "timezoneId": "America/Los_Angeles",
  "locale": "en-US",
  "colorScheme": "dark"
}
```


## network-intercept-and-mock

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


## performance-and-vitals

# Performance Forensics & Core Web Vitals

Optimizing agent execution and auditing client performance requires objective metrics rather than arbitrary sleep timers.

---

## 1. Core Web Vitals Auditing (`browser_performance`)

Retrieve Google Core Web Vitals, memory consumption, and frame rendering bottlenecks directly from the Chromium engine:

```json
{
  "metrics": ["vitals", "memory", "navigation"]
}
```

### Response Example:
```json
{
  "vitals": {
    "fcp": 320,
    "lcp": 780,
    "cls": 0.012,
    "inp": 45,
    "ttfb": 12
  },
  "memory": {
    "usedJSHeapSize": 44154880,
    "totalJSHeapSize": 71729152,
    "jsHeapSizeLimit": 4294705152
  }
}
```

Valid `metrics` sections: `"vitals"`, `"memory"`, `"navigation"`, `"resources"`, `"raw"`. Omit `metrics` to return all sections. Heap sizes are in **bytes**. The `"resources"` section populates `slowest_resources` (top 10 by duration).

---

## 2. Deterministic Synchronization (`browser_wait`)

> [!WARNING]
> NEVER call arbitrary fixed sleep timers (e.g. `sleep 5000`). Fixed sleeps waste user time and still fail when network latency spikes.

Always synchronize with deterministic browser conditions:

### Wait for Network Idle:
```json
{
  "for": "network",
  "timeout": 10000
}
```

### Wait for DOM Mutation Stability:
```json
{
  "for": "stable",
  "timeout": 10000
}
```

### Wait for a Specific Element to Appear:
```json
{
  "for": "element",
  "value": "[data-testid=\"checkout-complete\"]",
  "timeout": 15000
}
```
