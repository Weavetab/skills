#!/usr/bin/env node

const { select, confirm } = require('@inquirer/prompts');
const { installSkills, ALL_DOMAINS } = require('../src/api.js');

// High-contrast modern ANSI styling
const B  = '\x1b[38;2;99;102;241m'; // indigo primary
const CB = '\x1b[38;2;147;197;253m'; // sky cyan
const W  = '\x1b[97m'; // bright white
const DM = '\x1b[2m';  // dim
const Y  = '\x1b[33m'; // yellow
const G  = '\x1b[32m'; // green
const R  = '\x1b[31m'; // red
const X  = '\x1b[0m';  // reset

const line = `${B}${'━'.repeat(58)}${X}`;

async function run() {
  console.log('');
  console.log(line);
  console.log(`${B}  Weavetab MCP Skills Engine${X}  ${CB}v2.5.0-beta.3${X}`);
  console.log(`${DM}  Enterprise Domain-Driven Agent Intelligence${X}`);
  console.log(line);
  console.log('');
  console.log(`${CB}  ✦ 48 Official MCP Tools Mapped${X}`);
  console.log(`${CB}  ✦ Universal Step-0 ROUTER.md Decision Matrix${X}`);
  console.log(`${CB}  ✦ Multi-Agent Adapters (Antigravity, Cursor, Cline, Windsurf)${X}`);
  console.log('');

  const proceed = await confirm({
    message: 'Does your workspace have @weavetab/mcp installed or configured?',
    default: true
  });

  if (!proceed) {
    console.log('');
    console.log(`${DM}  Run: npm install -g @weavetab/mcp${X}`);
    console.log(`${DM}  Documentation: https://weavetab.pages.dev${X}`);
    console.log('');
    process.exit(0);
  }

  console.log('');

  // Step 1 — Select Domain Scope
  const scopeChoice = await select({
    message: 'Select Domain Scope to Install',
    choices: [
      {
        name: 'Full Enterprise Suite (All 9 Domains — Recommended)',
        value: 'all',
        description: 'Complete suite: browser, desktop, memory, resilience, security, plugins, perf, docs, dev'
      },
      {
        name: 'Web & Chromium Core (browser, memory, security)',
        value: 'web_core',
        description: 'Targeted for web scrapers, login automation, and interactive DOM tasks'
      },
      {
        name: 'Desktop & Native Electron Automation (desktop, security)',
        value: 'desktop',
        description: 'Targeted for Slack, Discord, VS Code, and Electron application agents'
      },
      {
        name: 'Resilience, Time-Travel & Memory (resilience, memory)',
        value: 'resilience',
        description: 'Checkpoints, state rollbacks, stale ref auto-healing, and macro compilation'
      },
      {
        name: 'Forensics, Network & Documents (network-and-perf, documents, developer)',
        value: 'forensics',
        description: 'TLS waterfalls, API mocking, Office ingestion, and GitHub API forensics'
      }
    ]
  });

  let selectedDomains = ALL_DOMAINS;
  if (scopeChoice === 'web_core') {
    selectedDomains = ['browser', 'memory', 'security'];
  } else if (scopeChoice === 'desktop') {
    selectedDomains = ['desktop', 'security'];
  } else if (scopeChoice === 'resilience') {
    selectedDomains = ['resilience', 'memory'];
  } else if (scopeChoice === 'forensics') {
    selectedDomains = ['network-and-perf', 'documents', 'developer'];
  }

  console.log('');

  // Step 2 — Select AI Agent Ecosystem
  const targetFramework = await select({
    message: 'Select Target AI Agent Framework',
    choices: [
      {
        name: 'Antigravity (.agent/skills/<domain>/SKILL.md)',
        value: '.agent',
        description: 'Native Antigravity standard with YAML frontmatter discovery'
      },
      {
        name: 'Cursor IDE (.cursor/rules/weavetab-<domain>.mdc)',
        value: '.cursor',
        description: 'Cursor rules with MDC frontmatter and glob matching'
      },
      {
        name: 'Cline (.clinerules)',
        value: '.clinerules',
        description: 'Consolidated markdown file with domain dividers'
      },
      {
        name: 'Windsurf IDE (.windsurf/rules/)',
        value: '.windsurf',
        description: 'Cascade / Windsurf project rules directory'
      },
      {
        name: 'OpenClaw (.openclaw/skills/)',
        value: '.openclaw',
        description: 'OpenClaw autonomous agent skill packages'
      },
      {
        name: 'RooCode (.roocode/rules/)',
        value: '.roocode',
        description: 'RooCode extension rules directory'
      },
      {
        name: 'Raw Markdown (weavetab-skills/)',
        value: 'generic',
        description: 'Portable markdown directory for any LLM prompt'
      }
    ]
  });

  console.log('');
  console.log(`${DM}  Installing ${selectedDomains.length} domain bundles...${X}`);

  try {
    const result = await installSkills({
      targetFramework,
      domains: selectedDomains,
      includeRouter: true
    });

    console.log('');
    console.log(line);
    console.log(`${G}  ✔ Success!${X}  ${result}`);
    console.log(`${CB}  Step-0 ROUTER.md matrix ready for your AI agent.${X}`);
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
