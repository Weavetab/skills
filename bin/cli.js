#!/usr/bin/env node

const { select, confirm } = require('@inquirer/prompts');
const { installSkills } = require('../src/api.js');

// Blue theme colors via ANSI
const B  = '\x1b[34m';   // blue
const CB = '\x1b[96m';   // bright cyan
const W  = '\x1b[97m';   // bright white
const DM = '\x1b[2m';    // dim
const Y  = '\x1b[33m';   // yellow
const G  = '\x1b[32m';   // green
const R  = '\x1b[31m';   // red
const X  = '\x1b[0m';    // reset

const line = `${B}${'─'.repeat(52)}${X}`;

async function run() {
  console.log('');
  console.log(line);
  console.log(`${B}  Weavetab MCP Skills${X}  ${DM}v1.0.3${X}`);
  console.log(`${DM}  Interactive skill installer for AI agents${X}`);
  console.log(line);
  console.log('');
  console.log(`${Y}  ! IMPORTANT${X}  These skills require Weavetab MCP v2.5.0+`);
  console.log(`${DM}  Install the MCP first: npm install -g weavetab${X}`);
  console.log(`${DM}  Website: https://weavetab.dev${X}`);
  console.log('');

  const proceed = await confirm({
    message: 'Does your agent have Weavetab MCP v2.5.0+ installed?',
    default: true
  });

  if (!proceed) {
    console.log('');
    console.log(`${DM}  Run: npm install -g weavetab${X}`);
    console.log(`${DM}  Then run this installer again.${X}`);
    console.log('');
    process.exit(0);
  }

  console.log('');

  // Step 1 — Select category
  console.log(`${B}  Available tiers:${X}`);
  console.log(`${G}    [1] General${X}    Core browser automation patterns (15 skills)`);
  console.log(`${DM}    [2] Automation   Coming soon${X}`);
  console.log(`${DM}    [3] Advanced     Coming soon${X}`);
  console.log('');

  const categoryChoice = await select({
    message: 'Select a skill tier to install',
    choices: [
      {
        name: 'General',
        value: 'general',
        description: '15 skills  ->  login, forms, scraping, navigation, uploads, and more'
      }
    ]
  });

  const categories = [categoryChoice];
  console.log('');

  // Step 2 — Select agent framework
  const targetFramework = await select({
    message: 'Select your AI agent format',
    choices: [
      {
        name: '.agents',
        value: '.agents',
        description: 'Antigravity, Copilot, OpenCode  ->  .agents/skills/weavetab/'
      },
      {
        name: '.cursor',
        value: '.cursor',
        description: 'Cursor IDE  ->  .cursor/rules/'
      },
      {
        name: '.clinerules',
        value: '.clinerules',
        description: 'Cline AI  ->  .clinerules'
      },
      {
        name: '.openclaw',
        value: '.openclaw',
        description: 'OpenClaw AI  ->  .openclaw/skills/'
      },
      {
        name: '.roocode',
        value: '.roocode',
        description: 'RooCode  ->  .roocode/rules/'
      },
      {
        name: '.windsurf',
        value: '.windsurf',
        description: 'Windsurf IDE  ->  .windsurf/rules/'
      },
      {
        name: 'aider',
        value: '.aider',
        description: 'Aider  ->  .aider.conf.yml'
      },
      {
        name: 'generic',
        value: 'generic',
        description: 'Other agents  ->  weavetab-skills/'
      }
    ]
  });

  console.log('');
  console.log(`${DM}  Installing skills...${X}`);

  try {
    const result = await installSkills({ targetFramework, categories });
    console.log('');
    console.log(line);
    console.log(`${G}  Done!${X}  ${result}`);
    console.log(`${B}  Your agent is ready for Weavetab MCP.${X}`);
    console.log(line);
    console.log('');
  } catch (e) {
    console.log('');
    console.error(`${R}  Error:${X}  ${e.message}`);
    console.log('');
    process.exit(1);
  }
}

run();
