---
id: file-upload
tier: general
triggers: []
tools: []
weavetab: ">=1.0.0"
---
# File Upload Pattern

1. **Map**: Find the file input element (`<input type="file">`) using `browser_map`. It may be hidden beneath a stylized button.
2. **Upload**: Use `browser_upload` with the absolute path to your local file and the input's ref ID. Do NOT try to `browser_click` the upload button to open an OS dialog—that will stall the agent.
3. **Verify**: Check for upload progress indicators or success messages via `browser_map({ delta: true })`.