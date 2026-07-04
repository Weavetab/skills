---
id: login-flow
tier: general
triggers: ["login", "sign in", "authenticate", "credentials", "log in", "username", "password"]
tools: ["browser_navigate", "browser_map", "browser_fill", "browser_type", "browser_click"]
weavetab: ">=2.5.0"
---
# 🔑 Autonomous Login Flow
**Core Philosophy:** Authentication flows vary wildly across the web. You must adapt to the specific site's architecture.

1. **Assess the Landscape:** When you land on a login page, use `browser_map` to understand the layout. Is it a single form? A multi-step flow? A social login?
2. **Execute Creatively:**
   - Use `browser_fill` for standard forms.
   - If inputs are hidden or complex, use `browser_type` to simulate human keystrokes.
3. **Handle Friction:** Expect captchas, 2FA prompts, or weird redirects. If the submit button doesn't work, try pressing Enter natively or looking for hidden validation errors.
4. **Verify State:** Always confirm you actually logged in by checking for authenticated UI elements (like a dashboard or avatar) before declaring success.
