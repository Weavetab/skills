#!/usr/bin/env node

const { select, checkbox, confirm } = require('@inquirer/prompts');
const { installSkills } = require('../src/api.js');

async function run() {
  console.log("\n==================================================");
  console.log("🚀 Welcome to the Weavetab MCP Skills Installer!");
  console.log("==================================================\n");

  console.log("\x1b[33m⚠️  IMPORTANT:\x1b[0m These skills only work if your AI agent has the Weavetab MCP server installed.");
  console.log("Make sure you have set up Weavetab MCP before using these skills.\n");

  const proceed = await confirm({ message: "Does your agent have Weavetab MCP installed?", default: true });
  if (!proceed) {
    console.log("\nPlease install Weavetab MCP first, then run this installer again. Goodbye!\n");
    process.exit(0);
  }

  const targetFramework = await select({
    message: 'Which AI Agent format are you using?',
    choices: [
      {
        name: '.agents (Antigravity, Copilot, OpenCode)',
        value: '.agents',
        description: 'Installs to .agents/skills/weavetab/'
      },
      {
        name: '.cursor (Cursor IDE)',
        value: '.cursor',
        description: 'Installs as .mdc files in .cursor/rules/'
      },
      {
        name: '.clinerules (Cline AI)',
        value: '.clinerules',
        description: 'Appends all skills to a .clinerules file'
      },
      {
        name: '.openclaw (OpenClaw AI)',
        value: '.openclaw',
        description: 'Installs to .openclaw/skills/'
      },
      {
        name: '.roocode (RooCode)',
        value: '.roocode',
        description: 'Installs to .roocode/rules/'
      },
      {
        name: '.windsurf (Windsurf IDE)',
        value: '.windsurf',
        description: 'Installs to .windsurf/rules/'
      },
      {
        name: 'Aider (.aider.conf.yml)',
        value: '.aider',
        description: 'Appends instructions for Aider'
      },
      {
        name: 'Generic Folder (Other Agents)',
        value: 'generic',
        description: 'Installs to weavetab-skills/ folder'
      }
    ]
  });

  const categories = await checkbox({
    message: 'Which categories of skills do you want to install?',
    choices: [
      { name: 'General (Tier 1)', value: 'general', checked: true },
      { name: 'Automation (Tier 2 - Coming Soon)', value: 'automation', disabled: true },
      { name: 'Advanced (Tier 3 - Coming Soon)', value: 'advanced', disabled: true }
    ],
    required: true
  });

  try {
    console.log('\nInstalling skills...');
    const result = await installSkills({ targetFramework, categories });
    console.log(`\n\x1b[32m✔ ${result}\x1b[0m\n`);
    console.log('✨ Your AI agent is now supercharged for Weavetab MCP! ✨\n');
  } catch (e) {
    console.error(`\n\x1b[31m✖ Error:\x1b[0m ${e.message}\n`);
    process.exit(1);
  }
}

run();
