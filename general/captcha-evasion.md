---
id: captcha-evasion
tier: general
triggers: ["captcha", "recaptcha", "hcaptcha", "bot check", "verification"]
tools: ["browser_wait", "browser_click", "browser_map", "browser_snapshot", "browser_ask"]
weavetab: ">=2.5.0"
---
# 🤖 Bot Challenge Handling
**Core Philosophy:** You will encounter anti-bot systems. Handle them gracefully.

- **Identify the Threat:** If a page suddenly looks weird, check for Cloudflare, reCAPTCHA, or hCaptcha challenge screens.
- **Attempt Resolution:** Some captchas are simple "Click to verify you are human" checkboxes. You can often `browser_click` these successfully.
- **Know Your Limits:** If you hit a complex image grid captcha, do not guess blindly. Use `browser_ask` to prompt the user for help, or wait and see if the challenge resolves itself. You are autonomous, but you know when to ask for human assistance.
