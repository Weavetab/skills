const fs = require('fs');
const path = require('path');

const packageRoot = path.join(__dirname, '..');
const scenariosPath = path.join(packageRoot, 'evals', 'scenarios.json');
const skillsJsonPath = path.join(packageRoot, 'skills.json');

const OFFICIAL_TOOLS = new Set([
  "browser_map", "browser_navigate", "browser_click", "browser_type",
  "browser_type_secret", "browser_key", "browser_scroll", "browser_dialog",
  "browser_burst", "browser_tabs", "browser_wait", "browser_captcha",
  "browser_thoughts", "browser_pointer", "browser_select", "browser_fill",
  "browser_highlight", "browser_upload", "browser_find", "browser_storage",
  "browser_network_intercept", "browser_console", "browser_pdf", "browser_eval",
  "browser_cookies", "browser_canvas", "browser_scrape", "browser_snapshot",
  "browser_screenshot", "browser_viewport", "browser_clipboard", "browser_inspect",
  "browser_extract_design", "browser_automation", "browser_recording",
  "browser_detect", "browser_performance",
  "browser_github", "browser_office", "browser_emulate", "list_plugins",
  "load_plugin", "browser_checkpoint", "browser_pattern_learn"
]);

const BANNED_TOOLS = [
  "browser_evaluate", "browser_ask", "scrape_page", "click_element", "fill_field"
];

console.log("====================================================");
console.log("Weavetab Agent Skills Evaluation Harness (evals/)");
console.log("====================================================");

if (!fs.existsSync(scenariosPath)) {
  console.error("Missing evals/scenarios.json");
  process.exit(1);
}

if (!fs.existsSync(skillsJsonPath)) {
  console.error("Missing skills.json. Run 'npm run build' first.");
  process.exit(1);
}

const scenariosData = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));
const skillsData = JSON.parse(fs.readFileSync(skillsJsonPath, 'utf8'));

let passed = 0;
let failed = 0;
const errors = [];

console.log(`Running evaluation on ${scenariosData.scenarios.length} scenarios...\n`);

for (const scenario of scenariosData.scenarios) {
  process.stdout.write(`  [TEST] ${scenario.id.padEnd(35)} `);

  const guidePath = path.join(packageRoot, scenario.expectedDomain, scenario.expectedGuide);
  if (!fs.existsSync(guidePath)) {
    console.log("❌ FAIL: Guide file missing");
    errors.push(`Scenario '${scenario.id}': Expected guide not found at ${guidePath}`);
    failed++;
    continue;
  }

  const guideContent = fs.readFileSync(guidePath, 'utf8');

  // 1. Verify expected tools are documented
  let toolsMissing = [];
  for (const tool of scenario.expectedTools) {
    if (!guideContent.includes(tool)) {
      toolsMissing.push(tool);
    }
  }

  if (toolsMissing.length > 0) {
    console.log(`❌ FAIL: Missing tools (${toolsMissing.join(', ')})`);
    errors.push(`Scenario '${scenario.id}': Guide ${scenario.expectedGuide} does not document required tools: ${toolsMissing.join(', ')}`);
    failed++;
    continue;
  }

  // 2. Verify no banned tools in guide
  let bannedFound = [];
  for (const banned of scenario.bannedTools || BANNED_TOOLS) {
    if (guideContent.includes(`\`${banned}\``) || guideContent.includes(`"${banned}"`)) {
      bannedFound.push(banned);
    }
  }

  if (bannedFound.length > 0) {
    console.log(`❌ FAIL: Contains banned tools (${bannedFound.join(', ')})`);
    errors.push(`Scenario '${scenario.id}': Guide ${scenario.expectedGuide} references banned tools: ${bannedFound.join(', ')}`);
    failed++;
    continue;
  }

  console.log("✔ PASS");
  passed++;
}

// Global Check: Verify all 48 tools appear across the entire skill base
console.log("\n----------------------------------------------------");
console.log("Auditing Global Tool Coverage Across All 9 Domains...");
const coveredTools = new Set();
for (const skill of skillsData.skills) {
  for (const t of skill.tools) {
    coveredTools.add(t);
  }
}

// Also scan markdown files for tools covered in text
for (const domain of skillsData.domains) {
  const dPath = path.join(packageRoot, domain);
  if (!fs.existsSync(dPath)) continue;
  for (const f of fs.readdirSync(dPath).filter(x => x.endsWith('.md'))) {
    const content = fs.readFileSync(path.join(dPath, f), 'utf8');
    for (const tool of OFFICIAL_TOOLS) {
      if (content.includes(tool)) {
        coveredTools.add(tool);
      }
    }
  }
}

let uncoveredTools = [];
for (const tool of OFFICIAL_TOOLS) {
  if (!coveredTools.has(tool)) {
    uncoveredTools.push(tool);
  }
}

console.log(`Official Tools In MCP: ${OFFICIAL_TOOLS.size}`);
console.log(`Covered in Skills:     ${coveredTools.size}`);

if (uncoveredTools.length > 0) {
  console.warn(`⚠️ Warning: Uncovered tools in skills: ${uncoveredTools.join(', ')}`);
}

console.log("====================================================");
console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
console.log("====================================================");

if (failed > 0) {
  console.error("\nFailure details:");
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log("\nAll benchmark evaluation tests passed successfully.");
  process.exit(0);
}
