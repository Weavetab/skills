#!/usr/bin/env node

const { select, confirm, checkbox } = require('@inquirer/prompts');
const { installSkills, ALL_DOMAINS, WEAVETAB_VERSION } = require('../src/api.js');

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

function normalizeFramework(fw) {
  if (!fw) return null;
  const f = fw.toLowerCase().trim();
  if (f === 'antigravity' || f === '.agent' || f === 'agent') return '.agent';
  if (f === 'cursor' || f === '.cursor') return '.cursor';
  if (f === 'cline' || f === '.clinerules' || f === 'clinerules') return '.clinerules';
  if (f === 'windsurf' || f === '.windsurf') return '.windsurf';
  if (f === 'openclaw' || f === '.openclaw') return '.openclaw';
  if (f === 'roocode' || f === '.roocode' || f === 'roo') return '.roocode';
  if (f === 'generic' || f === 'markdown' || f === 'raw') return 'generic';
  return fw;
}

function mapScope(scope) {
  if (!scope || scope === 'all' || scope === 'full') return ALL_DOMAINS;
  if (scope.includes(',')) {
    const list = scope.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const valid = list.filter(d => ALL_DOMAINS.includes(d));
    return valid.length > 0 ? valid : ALL_DOMAINS;
  }
  const single = scope.trim().toLowerCase();
  if (ALL_DOMAINS.includes(single)) return [single];
  return ALL_DOMAINS;
}

async function run() {
  const rawArgs = process.argv.slice(2);
  let cliFramework = null;
  let cliScope = null;
  let skipConfirm = false;

  for (let i = 0; i < rawArgs.length; i++) {
    const a = rawArgs[i];
    if (a === '--framework' || a === '-f' || a === '--agent') {
      cliFramework = normalizeFramework(rawArgs[++i]);
    } else if (a === '--scope' || a === '-s' || a === '--domains') {
      cliScope = rawArgs[++i];
    } else if (a === '--yes' || a === '-y') {
      skipConfirm = true;
    } else if (a === '--help' || a === '-h') {
      console.log(`
Usage: npx @weavetab/skills@latest [options]

Options:
  -f, --framework <name>   Target agent framework (.agent, .cursor, .clinerules, .windsurf, .openclaw, .roocode, generic)
  -s, --scope <folders>    Folders to install (e.g. browser,security, or 'all')
  -y, --yes                Skip confirmation prompts (installs all folders)
  -h, --help               Show help
`);
      process.exit(0);
    }
  }

  console.log('');
  console.log(line);
  console.log(`${B}  Weavetab MCP Skills Engine${X}  ${CB}v${WEAVETAB_VERSION}${X}`);
  console.log(`${DM}  Enterprise Domain-Driven Agent Intelligence${X}`);
  console.log(line);
  console.log('');
  console.log(`${CB}  ✦ 44 Official MCP Tools Mapped${X}`);
  console.log(`${CB}  ✦ Universal Step-0 ROUTER.md Decision Matrix${X}`);
  console.log(`${CB}  ✦ Multi-Agent Adapters (Antigravity, Cursor, Cline, Windsurf)${X}`);
  console.log('');

  if (!skipConfirm && !cliFramework) {
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
  }

  console.log('');

  // Step 1 — Select Domain Folders
  let selectedDomains = ALL_DOMAINS;
  if (cliScope) {
    selectedDomains = mapScope(cliScope);
  } else if (!skipConfirm) {
    selectedDomains = await checkbox({
      message: 'Select Domain Folders to Install (all selected by default, press Space to unselect)',
      choices: [
        {
          name: 'browser (/browser) — Core DOM interaction, navigation, wait, tabs, input',
          value: 'browser',
          checked: true
        },
        {
          name: 'desktop (/desktop) — Desktop & Electron apps, Slack, Discord, VS Code',
          value: 'desktop',
          checked: true
        },
        {
          name: 'memory (/memory) — Site profiles, selector memory, session trails',
          value: 'memory',
          checked: true
        },
        {
          name: 'resilience (/resilience) — Loop breaker, checkpoints, anti-captcha, recovery',
          value: 'resilience',
          checked: true
        },
        {
          name: 'security (/security) — Permission boundaries, domain filters, secret injection',
          value: 'security',
          checked: true
        },
        {
          name: 'plugins (/plugins) — Plugin management, discovery, dynamic tool loading',
          value: 'plugins',
          checked: true
        },
        {
          name: 'network-and-perf (/network-and-perf) — HAR, network intercept, cookies, performance',
          value: 'network-and-perf',
          checked: true
        },
        {
          name: 'documents (/documents) — Office documents, Word, Excel, PowerPoint, PDF',
          value: 'documents',
          checked: true
        },
        {
          name: 'developer (/developer) — GitHub forensics, issue/PR inspection',
          value: 'developer',
          checked: true
        }
      ]
    });

    if (!selectedDomains || selectedDomains.length === 0) {
      console.log(`${Y}  No folders selected, defaulting to all domain folders.${X}`);
      selectedDomains = ALL_DOMAINS;
    }
  }

  console.log('');

  // Step 2 — Select AI Agent Ecosystem
  let targetFramework = cliFramework;
  if (!targetFramework) {
    targetFramework = await select({
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
  }

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
