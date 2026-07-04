---
id: form-filling
tier: general
triggers: ["fill form", "submit form", "form", "input", "textarea", "dropdown", "select", "checkbox"]
tools: [browser_map, browser_fill, browser_type, browser_select, browser_click]
weavetab: ">=2.5.0"
---
# Form Filling Pattern

1. **Map the Form**: Call `browser_map({ scope: "form" })` to gather all interactive element IDs. Do not map the entire page if you only need the form.
2. **Batch Fill**: If possible, batch your input using `browser_fill` across multiple fields to save time.
3. **Selects**: Use `browser_select` for dropdowns, not `browser_click`.
4. **Submit**: Click the submit button and check the response for `confirmed: true`. Wait for network idle or DOM changes using `browser_wait`.