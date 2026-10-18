---
id: device-and-environment
domain: network-and-perf
triggers:
  - "emulate device"
  - "mobile view"
  - "throttle network"
  - "geolocation override"
  - "user agent"
  - "responsive testing"
tools:
  - "browser_viewport"
  - "browser_emulate"
weavetab: ">=2.5.0"
---

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
