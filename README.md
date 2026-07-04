# 🚀 Weavetab MCP Skills

Welcome to the official **Weavetab MCP Skills** repository! This package provides powerful, native drop-in Agent Skills to supercharge your AI (like Antigravity, Cursor, Cline, RooCode, OpenClaw, and more) with browser automation capabilities.

🌐 **Official Website:** [weavetab.dev](https://weavetab.dev)
📦 **Core MCP Package:** [`weavetab`](https://www.npmjs.com/package/weavetab)

## ⚠️ Prerequisites

These advanced skills are designed specifically for **Weavetab MCP v2.5.0+**.
Make sure you have installed the core Weavetab MCP server first:

```bash
npm install -g weavetab
```

## 🛠️ Installation

We provide a beautiful, interactive CLI installer that seamlessly injects the pure markdown skills into your specific AI agent's configuration folder without cluttering your project with `node_modules`.

Run the following command anywhere:

```bash
npx @weavetab/skills
```

The interactive menu will guide you to select your agent framework (`.agents`, `.cursor`, `.clinerules`, `.roocode`, etc.) and the categories of skills you want to install.

## 📚 Skill Categories

- **General (Tier 1):** Essential browser navigation, DOM interaction, guards against abuse, form filling, tab management, and more.
- **Automation (Tier 2):** *Coming Soon*
- **Advanced (Tier 3):** *Coming Soon*

## 💻 Programmatic API

If you are building your own CLI or using the core `wt setup` command, you can install skills programmatically:

```javascript
const { installSkills } = require('@weavetab/skills');

await installSkills({
  targetFramework: '.cursor', // or '.agents', '.clinerules', etc.
  categories: ['general']
});
```

---

*Built with ❤️ by [fy2ne](https://github.com/fy2ne) for the Weavetab Community.*
