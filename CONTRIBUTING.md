# Contributing to Weavetab MCP Skills

> **Version:** 2.6.2 | **Package:** `@weavetab/skills` | **Last Updated:** August 2026

Thank you for your interest in contributing! This repository relies on community contributions to build the most powerful, autonomous AI skills possible.

---

## Table of Contents

- [Claiming Issues (`/claim`)](#claiming-issues-claim)
- [Adding a New Skill](#adding-a-new-skill)
- [Pull Request Process & Budget Gate](#pull-request-process--budget-gate)
- [Rules & Guidelines](#rules--guidelines)
- [Code of Conduct](#code-of-conduct)

---

## Claiming Issues (`/claim`)

We prevent duplicate efforts and collisions by letting contributors claim open issues before authoring skills:

1. **Claiming**: Comment `/claim` on any open, unassigned issue or skill request.
   - The bot immediately assigns the issue to you and attaches the `claimed` label.
   - You receive an exclusive **7-day claim window** to implement the skill and open a pull request.
2. **Releasing**: If you decide not to proceed or get busy, comment `/unclaim` to release the issue back to the community.
3. **Stale Claims**: Claims without active linked pull requests automatically expire after **7 days** (swept nightly by GitHub Actions) so issues do not remain locked indefinitely.

---

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
weavetab: ">=2.6.2"
---
```

4. **Write the Skill Content** below the frontmatter:
   - **Focus on Autonomy:** Do not write rigid step-by-step click paths. Instead, write "Core Philosophies" and adaptive guidelines that teach the agent *how to think* and *how to recover* from errors.
   - **Be Professional:** Keep the tone authoritative, technical, and concise.
5. **Rebuild the registry:** Run `npm run build` to regenerate the `skills.json` file. Your new skill must be included in this JSON file to be distributed via NPX.
6. **Open a Pull Request** referencing the issue you claimed (e.g. `Fixes #123`).

---

## Pull Request Process & Budget Gate

1. Fork the repository and create your branch from `main`.
2. Ensure build and tests pass: `npm test && npm run build`.
3. Submit your pull request using our standard `.github/PULL_REQUEST_TEMPLATE.md`.

### 1. Hard Line-Budget Gate (+500 Lines)
All pull requests are monitored by our **Pull Request Guard** GitHub Action:
- **Maximum additions**: **+500 lines** of skill definitions (excluding generated `skills.json` and assets).
- PRs exceeding +500 lines fail automated CI checks with the `size/blocked-over-500` label.
- **Why?** Focused skills are easier to evaluate, audit, and benchmark against real agent runs.

### 2. Mandatory AI Agent / Assistant Disclosure
We welcome skills crafted with AI coding agents (Antigravity, Claude Code, Cursor, Windsurf, Copilot, etc.) as well as 100% human-authored contributions. However, **transparency is mandatory**:
- In the PR template, select which AI tool or workflow was utilized.
- Skills must be thoroughly benchmarked with real browsers, free of placeholder stubs and hallucinated tool calls.

---

## Rules & Guidelines

- **Weavetab Focused:** Skills must be specifically designed for **Weavetab MCP** and use its native toolset.
- **Version Requirement:** Skills must require **Weavetab MCP v2.6.2+**.
- **Single Responsibility:** Keep skill files focused on a single task pattern or workflow.
- **No Emojis:** We maintain a professional standard in skill documentation to ensure strict parsing by AI agents.

---

## Code of Conduct

Be respectful and constructive. This is a community project built by developers, for developers.
