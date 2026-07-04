# Weavetab MCP Skills

[![npm version](https://img.shields.io/npm/v/@weavetab/skills.svg)](https://www.npmjs.com/package/@weavetab/skills)
[![GitHub stars](https://img.shields.io/github/stars/Weavetab/skills.svg?style=social)](https://github.com/Weavetab/skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Welcome to the official Weavetab MCP Skills repository. This package provides native drop-in Agent Skills designed to enhance AI assistants (such as Antigravity, Cursor, Cline, RooCode, OpenClaw, and others) with advanced browser automation and intelligent web interaction capabilities.

- **Official Website:** [weavetab.dev](https://weavetab.dev)
- **Core MCP Package:** [`weavetab`](https://www.npmjs.com/package/weavetab)

## Prerequisites

These advanced skills require **Weavetab MCP v2.5.0 or higher**.
Please ensure you have installed the core Weavetab MCP server prior to using these skills:

```bash
npm install -g weavetab
```

## Installation and Usage

For standard users, we provide an interactive CLI installer that seamlessly injects the markdown skills directly into your specific AI agent's configuration folder. This prevents cluttering your project directory with unnecessary dependencies.

Run the following command in your terminal from the root of your project:

```bash
npx @weavetab/skills
```

The interactive menu will guide you to select your agent framework (`.agents`, `.cursor`, `.clinerules`, `.roocode`, etc.) and the categories of skills you wish to install.

## Skill Categories

- **General (Tier 1):** Essential browser navigation, DOM interaction, guards against abuse, form filling, tab management, intelligent data extraction, and more.
- **Automation (Tier 2):** *Coming Soon*
- **Advanced (Tier 3):** *Coming Soon*

## Programmatic API

If you are building your own CLI or integrating with the core `wt setup` command, you can install skills programmatically:

```javascript
const { installSkills } = require('@weavetab/skills');

await installSkills({
  targetFramework: '.cursor', // or '.agents', '.clinerules', etc.
  categories: ['general']
});
```

## Contributing

We welcome community contributions! If you have built a robust browser automation skill that handles complex scenarios, we encourage you to add it to this repository.

Please review our [Contributing Guidelines](CONTRIBUTING.md) for detailed instructions on how to propose new skills, format your pull requests, and adhere to our core philosophies for agent autonomy.

---

*Built for the Weavetab Community.*
