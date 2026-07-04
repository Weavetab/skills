# WeaveTab Skills

A repository of token-efficient, context-aware prompt injection skills for AI agents using the WeaveTab MCP.

## Structure
- `general/`: Tier 1 task patterns (e.g., login, forms, infinite scroll).
- `automation/`: CI/headless flows (Coming in v1.1.0).
- `advanced/`: Token budgeting and memory features (Coming in v1.1.0).

## Build
To compile `skills.json`:
```bash
npm install
npm run build
```

## How to Use Specific Skills

Users can install the package via npm:
```bash
npm install @weavetab/skills
```

To load a specific skill into your agent (e.g. `login-flow`), you can read the raw markdown file directly from the package directory:
```bash
cat node_modules/@weavetab/skills/general/login-flow.md
```

You can also read `skills.json` to programmatically load the skills into your agent's context based on the current URL or task triggers.
