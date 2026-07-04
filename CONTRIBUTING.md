# Contributing to Weavetab MCP Skills

Thank you for your interest in contributing! This repository relies on community contributions to build the most powerful, autonomous AI skills possible.

## Adding a New Skill

We encourage developers to add new skills that teach AI agents how to navigate complex web scenarios autonomously.

### Step-by-Step Guide

1. **Fork the repository** and clone it locally.
2. **Create a new `.md` file** in the appropriate category folder (e.g., `general/`, `automation/`, `advanced/`).
3. **Use the required YAML frontmatter** at the top of your file. Example:

```yaml
---
id: your-skill-name
tier: general
triggers: [keyword1, keyword2]
tools: [browser_navigate, browser_click]
weavetab: ">=2.5.0"
---
```

4. **Write the Skill Content** below the frontmatter.
   - **Focus on Autonomy:** Do not write rigid step-by-step click paths. Instead, write "Core Philosophies" and adaptive guidelines that teach the agent *how to think* and *how to recover* from errors.
   - **Be Professional:** Keep the tone authoritative and technical.
5. **Rebuild the registry:** Run `npm run build` to regenerate the `skills.json` file. Your new skill must be included in this JSON file to be distributed via NPX.
6. **Open a Pull Request** with a detailed description of the scenario your skill solves.

## Rules & Guidelines

- **Weavetab Focused:** Skills must be specifically designed for **Weavetab MCP** and utilize its native toolset.
- **Version Requirement:** Skills must require **Weavetab MCP v2.5.0+**.
- **Single Responsibility:** Keep skill files focused on a single task pattern or workflow.
- **No Emojis:** We maintain a professional standard in skill documentation to ensure strict parsing by AI agents.

## Code of Conduct

Be respectful and constructive. This is a community project built by developers, for developers.
