const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

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
  "browser_reset_loop_counter", "browser_detect", "browser_performance",
  "browser_macro_compile", "github_analyze", "github_read", "github_issues",
  "github_get_pr", "browser_office", "browser_emulate", "list_plugins",
  "load_plugin", "browser_checkpoint"
]);

const BANNED_TOOLS = new Set([
  "browser_evaluate", "browser_ask", "scrape_page", "click_element", "fill_field"
]);

const DOMAINS = [
  'browser',
  'desktop',
  'memory',
  'resilience',
  'security',
  'plugins',
  'network-and-perf',
  'documents',
  'developer'
];

const packageRoot = path.join(__dirname, '..');
const distGranularDir = path.join(packageRoot, 'dist', 'granular');
const distBundledDir = path.join(packageRoot, 'dist', 'bundled');

fs.mkdirSync(distGranularDir, { recursive: true });
fs.mkdirSync(distBundledDir, { recursive: true });

const skills = [];
const domainBundles = {};
let allSkillsCombined = "# Weavetab Complete Enterprise Agent Suite (v2.5.0-beta.3)\n\n";

function parseMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const frontmatter = yaml.parse(match[1]);
  const body = content.slice(match[0].length).trim();
  const relativePath = path.relative(packageRoot, filePath).replace(/\\/g, '/');

  // Tool validation
  if (frontmatter.tools && Array.isArray(frontmatter.tools)) {
    for (const tool of frontmatter.tools) {
      if (BANNED_TOOLS.has(tool)) {
        throw new Error(`File ${relativePath} references banned legacy tool: '${tool}'`);
      }
      if (!OFFICIAL_TOOLS.has(tool)) {
        throw new Error(`File ${relativePath} references unknown tool: '${tool}'. Must be one of the 48 official tools.`);
      }
    }
  }

  return {
    ...frontmatter,
    filePath: relativePath,
    body,
    fullContent: content
  };
}

console.log("Building @weavetab/skills v2.5.0-beta.3...");

for (const domain of DOMAINS) {
  const domainDir = path.join(packageRoot, domain);
  if (!fs.existsSync(domainDir)) continue;

  domainBundles[domain] = [];
  const files = fs.readdirSync(domainDir).filter(f => f.endsWith('.md') && f !== 'README.md');

  for (const file of files) {
    const fullPath = path.join(domainDir, file);
    try {
      const parsed = parseMarkdown(fullPath);
      if (parsed) {
        skills.push({
          id: parsed.id,
          domain: parsed.domain || domain,
          triggers: parsed.triggers || [],
          tools: parsed.tools || [],
          weavetab: parsed.weavetab || ">=2.5.0-beta.3",
          filePath: parsed.filePath
        });

        domainBundles[domain].push(parsed);

        // Copy to dist/granular
        const destGranular = path.join(distGranularDir, `${domain}_${file}`);
        fs.writeFileSync(destGranular, parsed.fullContent);
      }
    } catch (e) {
      console.error(`Build failed in ${fullPath}: ${e.message}`);
      process.exit(1);
    }
  }

  // Create bundled domain profile
  const bundleContent = [
    `# Weavetab Domain Profile: ${domain.toUpperCase()}`,
    `Generated for @weavetab/skills v2.5.0-beta.3\n`,
    ...domainBundles[domain].map(item => `## ${item.id}\n\n${item.body}\n`)
  ].join('\n\n');

  fs.writeFileSync(path.join(distBundledDir, `weavetab-${domain}.md`), bundleContent);
  allSkillsCombined += `\n\n# ====================================================\n# DOMAIN: ${domain.toUpperCase()}\n# ====================================================\n\n` + bundleContent;
}

// Write master combined bundle
fs.writeFileSync(path.join(distBundledDir, 'weavetab-all.md'), allSkillsCombined);

// Write skills.json
fs.writeFileSync(
  path.join(packageRoot, 'skills.json'),
  JSON.stringify({
    version: "2.5.0-beta.3",
    domains: DOMAINS,
    officialToolsCount: OFFICIAL_TOOLS.size,
    skillsCount: skills.length,
    skills
  }, null, 2)
);

console.log(`Successfully compiled:`);
console.log(`  - 48 Official MCP Tools Verified`);
console.log(`  - ${skills.length} Individual Skills Parsed`);
console.log(`  - 9 Domain Bundles in dist/bundled/`);
console.log(`  - Granular Dist in dist/granular/`);
console.log(`  - Updated skills.json generated.`);
