---
id: form-filling
tier: general
triggers: ["fill form", "submit form", "form", "input", "textarea", "dropdown", "select", "checkbox"]
tools: ["browser_map", "browser_fill", "browser_type", "browser_select", "browser_click"]
weavetab: ">=2.5.0"
---
# 📝 Dynamic Form Handling
**Core Philosophy:** Forms are often dynamic, fragile, and aggressively validated. Handle them with care and intelligence.

- **Map and Plan:** Use `browser_map({ scope: "form" })` to get the lay of the land. Plan your data entry.
- **Adapt to the UI:** 
  - For standard fields, `browser_fill` is fast and efficient.
  - For tricky rich-text editors or masked inputs, fall back to `browser_type`.
  - Use `browser_select` for dropdowns, but be prepared to use `browser_click` if it's a custom div-based dropdown.
- **Validation Awareness:** Pay attention to the DOM! If a field turns red, stop and fix it. Don't blindly submit a form with errors. If you see a disabled submit button, figure out which required field you missed.
