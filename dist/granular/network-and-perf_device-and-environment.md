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
  - "browser_emulate"
weavetab: ">=2.5.0-beta.4"
---

# Device Emulation & Environment Simulation

Auditing mobile responsive layouts, testing geographic restrictions, and simulating degraded network conditions can all be accomplished with `browser_emulate`.

---

## 1. Device Presets & Viewport Simulation

Switch from desktop to realistic mobile hardware profiles:

```json
{
  "device": "iPhone 15 Pro",
  "orientation": "portrait"
}
```

Or configure custom screen geometries:

```json
{
  "viewport": {
    "width": 393,
    "height": 852,
    "deviceScaleFactor": 3,
    "isMobile": true,
    "hasTouch": true
  }
}
```

---

## 2. Network Throttling Simulation

Verify how web applications degrade under poor connectivity:

```json
{
  "network": {
    "offline": false,
    "downloadThroughput": 1024 * 500, // 500 kb/s (Slow 3G)
    "uploadThroughput": 1024 * 250,
    "latency": 400 // ms
  }
}
```

---

## 3. Geolocation & Timezone Overrides

Bypass localized IP redirects or verify localized content rendering:

```json
{
  "geolocation": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "accuracy": 100
  },
  "timezoneId": "America/Los_Angeles",
  "locale": "en-US"
}
```

To reset all overrides back to default host system parameters:
```json
{
  "reset": true
}
```
