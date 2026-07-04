---
id: file-upload
tier: general
triggers: ["upload", "file upload", "attach file", "drag and drop", "input file"]
tools: ["browser_upload", "browser_map", "browser_click", "browser_find"]
weavetab: ">=2.5.0"
---
# 📤 Resilient File Uploading
**Core Philosophy:** File uploads can be triggered via hidden inputs, drag-and-drop zones, or complex JS widgets.

- **Find the Real Input:** Often, the visible "Upload" button is just a styled div. You need to find the actual `<input type="file">`. Use `browser_find` or `browser_map` to hunt it down.
- **Use the Native Tool:** Once found, use `browser_upload` to attach the file directly to the input element.
- **Creative Fallbacks:** If `browser_upload` fails because the input is deeply obscured, look for alternative ways to upload (e.g., providing a URL if the site allows it, or alerting the user that manual intervention is needed for this specific widget).
