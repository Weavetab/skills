---
id: login-flow
tier: general
triggers: []
tools: []
weavetab: ">=1.0.0"
---
# Login Flow Pattern

1. **Navigate**: Use `browser_navigate` to reach the login page.
2. **Map**: Call `browser_map({ scope: "form" })` to get the ref IDs of the inputs and submit button. Cache these IDs.
3. **Fill**: Use `browser_fill` or `browser_type` to enter credentials using the ref IDs.
4. **Submit**: Use `browser_click` on the submit button's ref ID. Do not press "Enter" blindly unless you confirm the form submits.
5. **Verify**: Use `browser_map({ delta: true })` to verify the page changed (e.g., checking for a logout button or dashboard elements).