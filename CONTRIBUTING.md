# Contributing to Weavetab MCP Skills

Thank you for your interest in contributing! Here is how you can help.

## Adding a New Skill

1. Fork the repository.
2. Create a new `.md` file in the appropriate category folder (`general/`, `automation/`, `advanced/`).
3. Use the following frontmatter at the top of your file:

```yaml
---
id: your-skill-name
tier: general
triggers: [keyword1, keyword2]
tools: [browser_navigate, browser_click]
weavetab: ">=2.5.0"
---
```

4. Write clear, concise instructions for the AI agent below the frontmatter.
5. Run `npm run build` to regenerate `skills.json`.
6. Open a Pull Request with a description of what your skill does.

## Rules

- Skills must be specifically for **Weavetab MCP** — not generic AI instructions.
- Skills must require **Weavetab MCP v2.5.0+**.
- Keep skill files focused on a single task pattern.
- No emojis in skill content (keep it clean and professional).

## Code of Conduct

Be respectful and constructive. This is a community project.
