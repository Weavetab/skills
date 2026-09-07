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
weavetab: ">=2.5.0-beta.3"
---

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
