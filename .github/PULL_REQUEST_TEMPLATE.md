## Summary of Changes

A clear, concise description of what skill is added, updated, or refactored.

---

## Linked Issue

- Fixes #(issue number)
- Closes #(issue number)

*(If this PR fulfills an issue you claimed via `/claim`, link it here).*

---

## AI Agent / Assistant Disclosure

Transparency matters. Please select the primary AI assistant or agent workflow used to draft or implement this change:

- [ ] **Antigravity**
- [ ] **Claude Code**
- [ ] **Cursor**
- [ ] **Windsurf**
- [ ] **GitHub Copilot**
- [ ] **None (100% Human authored)**
- [ ] **Other** (specify in description)

---

## Sizing & Code Health Checklist

- [ ] **Line-budget**: Total additions are under **+500 lines** of skill code (excluding generated `skills.json`).
- [ ] **Compatibility**: Frontmatter specifies `weavetab: ">=2.6.2"`.
- [ ] **Single concern**: Adds or updates one specific skill pattern.
- [ ] **Build verified**: Ran `npm run build` and `skills.json` is cleanly regenerated.
- [ ] **Anti-AI slop**: No generic fluff, no redundant instructions, clean focused directives.
- [ ] **Style standard**: Clean formatting, no unnecessary emojis or filler prose.

---

## Verification & Test Results

Paste test execution summary or terminal logs below:

```bash
# Example: npm test && npm run build
```
