---
id: captcha-evasion
tier: general
triggers: []
tools: []
weavetab: ">=1.0.0"
---
# CAPTCHA Evasion & Handling

1. **Detection**: If `browser_navigate` stalls or `browser_map` reveals "Verify you are human" or Cloudflare interstitial pages, you have hit an anti-bot check.
2. **Slow Down**: Do not spam clicks or rapid navigations. Stop and use `browser_wait({ delay: 5000 })` to let the automatic human-simulation heuristics in Weavetab MCP attempt to solve it in the background.
3. **Manual Solve**: If it requires clicking a checkbox (e.g. Turnstile or reCAPTCHA), find the iframe or checkbox ID via `browser_map`, and use `browser_click` with `intent: "click captcha checkbox"`.
4. **Bypass**: Avoid triggering them by not using `force: true` or `fast: true` flags unless necessary, as they bypass Weavetab MCP's built-in stealth patterns.