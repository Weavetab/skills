---
id: iframe-handling
tier: general
triggers: []
tools: []
weavetab: ">=1.0.0"
---
# Iframe Handling Pattern

1. **Identify Iframes**: If an element you expect (like a Stripe credit card field) isn't visible in `browser_map`, it might be inside a cross-origin iframe. Look for `[w:XX] iframe` elements in the map.
2. **Target Iframe**: Weavetab MCP's `browser_map` automatically tries to pierce iframes, but cross-origin security may block it. If an iframe is blocked, you cannot click elements inside it using standard `id` refs.
3. **Fallback**: Use `browser_eval` to execute JS within the context of the page if you need to manipulate iframe communication via `postMessage`, or notify the user that manual intervention is required for secure cross-origin iframes.