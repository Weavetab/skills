# Weavetab Domain Profile: NETWORK-AND-PERF

Generated for @weavetab/skills v2.5.0-beta.4


## device-and-environment

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


## network-intercept-and-mock

# Network Interception, Mocking & TLS Forensics

Autonomous testing and debugging often require simulating backend error states (e.g. 500 Internal Server Error, 429 Rate Limit), stubbing third-party analytics, or verifying TLS/SSL certificates.

`browser_network_intercept` provides fine-grained CDP request and response modification.

---

## 1. Mocking API Responses

Intercept outgoing HTTP requests matching a URL pattern and return custom mock data:

```json
{
  "pattern": "*/api/v1/user/profile",
  "response": {
    "status": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": "{\"id\": \"usr_test\", \"role\": \"admin\", \"credits\": 9999}"
  }
}
```

---

## 2. Blocking Unnecessary Traffic & Trackers

Accelerate page loads and eliminate token bloat by aborting non-essential requests:

```json
{
  "pattern": "*google-analytics.com*",
  "action": "abort",
  "errorReason": "BlockedByClient"
}
```

---

## 3. TLS / SSL Forensics & Timing Waterfalls

Extract cryptographic handshake metadata, cipher suites, expiration dates, and microsecond network waterfalls (DNS lookup, TCP connect, SSL handshake, TTFB):

```json
{
  "action": "auditTls",
  "url": "https://weavetab.pages.dev"
}
```

### Response Example:
```json
{
  "security": {
    "protocol": "TLS 1.3",
    "cipher": "AES_128_GCM",
    "issuer": "Let's Encrypt",
    "validTo": "2026-11-15T00:00:00.000Z"
  },
  "waterfall": {
    "dnsMs": 1.4,
    "tcpMs": 3.2,
    "sslMs": 4.1,
    "ttfbMs": 12.8
  }
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
  "metrics": ["vitals", "memory", "navigationTiming"]
}
```

### Response Example:
```json
{
  "vitals": {
    "fcp": 320,
    "lcp": 780,
    "cls": 0.012,
    "fid": 8,
    "inp": 45
  },
  "memory": {
    "jsHeapUsedSizeMb": 42.1,
    "jsHeapTotalSizeMb": 68.4
  }
}
```

---

## 2. Deterministic Synchronization (`browser_wait`)

> [!WARNING]
> NEVER call arbitrary fixed sleep timers (e.g. `sleep 5000`). Fixed sleeps waste user time and still fail when network latency spikes.

Always synchronize with deterministic browser conditions:

### Wait for Network Idle:
```json
{
  "condition": "network_idle",
  "timeout": 10000
}
```

### Wait for DOM Mutation Stability:
```json
{
  "condition": "dom_stable",
  "duration": 500,
  "timeout": 10000
}
```

### Wait for a Specific Element to Appear:
```json
{
  "condition": "element_visible",
  "selector": "[data-testid=\"checkout-complete\"]",
  "timeout": 15000
}
```
