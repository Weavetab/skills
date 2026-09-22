const fs = require('fs');
const path = require('path');

const packageRoot = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const WEAVETAB_VERSION = pkg.version;
const skillsJsonPath = path.join(packageRoot, 'skills.json');
const routerPath = path.join(packageRoot, 'ROUTER.md');
const distBundledDir = path.join(packageRoot, 'dist', 'bundled');

const ALL_DOMAINS = [
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

/**
 * Read the pre-compiled skills catalog.
 */
function getSkills() {
  if (!fs.existsSync(skillsJsonPath)) {
    throw new Error("skills.json not found. Run 'npm run build' first.");
  }
  return JSON.parse(fs.readFileSync(skillsJsonPath, 'utf8'));
}

/**
 * Retrieve a specific skill by its ID.
 */
function getSkill(id) {
  const data = getSkills();
  return data.skills.find(s => s.id === id) || null;
}

/**
 * Retrieve all skills belonging to a domain.
 */
function getSkillsByDomain(domain) {
  const data = getSkills();
  return data.skills.filter(s => s.domain === domain);
}

/**
 * Read the universal intent decision matrix (ROUTER.md).
 */
function getRouterMatrix() {
  if (!fs.existsSync(routerPath)) return "";
  return fs.readFileSync(routerPath, 'utf8');
}

/**
 * Programmatically install Weavetab MCP skills into a target project.
 * 
 * @param {Object} options
 * @param {string} options.targetFramework - '.agents', '.cursor', '.clinerules', '.windsurf', '.openclaw', '.roocode', '.aider', or 'generic'
 * @param {string[]} [options.domains] - Domains to install (e.g. ['browser', 'security']). Defaults to all domains.
 * @param {string} [options.projectRoot] - Root directory to install into (defaults to process.cwd())
 * @param {boolean} [options.includeRouter=true] - Whether to include the Step-0 ROUTER.md matrix.
 * @returns {Promise<string>} - Confirmation message and target path.
 */
async function installSkills({
  targetFramework,
  domains = ALL_DOMAINS,
  projectRoot = process.cwd(),
  includeRouter = true
}) {
  if (!targetFramework) {
    throw new Error("targetFramework is required (e.g. '.agents', '.cursor', '.clinerules').");
  }

  if (!domains || domains.length === 0) {
    domains = ALL_DOMAINS;
  }

  const routerContent = getRouterMatrix();

  // Load domain bundled content
  const domainBundles = {};
  for (const domain of domains) {
    const bundleFile = path.join(distBundledDir, `weavetab-${domain}.md`);
    if (fs.existsSync(bundleFile)) {
      domainBundles[domain] = fs.readFileSync(bundleFile, 'utf8');
    }
  }

  // 1. Antigravity & Standard Agent Tree (.agent/skills/<skill-name>/SKILL.md)
  if (targetFramework === '.agents' || targetFramework === '.agent') {
    const baseSkillsDir = path.join(projectRoot, '.agent', 'skills');
    fs.mkdirSync(baseSkillsDir, { recursive: true });

    if (includeRouter) {
      const routerDir = path.join(baseSkillsDir, 'weavetab-router');
      fs.mkdirSync(routerDir, { recursive: true });
      const routerFrontmatter = [
        "---",
        "name: weavetab-router",
        "description: Step-0 Universal Intent Decision Matrix for Weavetab MCP automation",
        "---",
        "",
        routerContent
      ].join('\n');
      fs.writeFileSync(path.join(routerDir, 'SKILL.md'), routerFrontmatter);
    }

    for (const [domain, content] of Object.entries(domainBundles)) {
      const skillDir = path.join(baseSkillsDir, `weavetab-${domain}`);
      fs.mkdirSync(skillDir, { recursive: true });
      const frontmatter = [
        "---",
        `name: weavetab-${domain}`,
        `description: Operational guidance for Weavetab MCP ${domain} domain automation and tool protocols.`,
        "---",
        "",
        content
      ].join('\n');
      fs.writeFileSync(path.join(skillDir, 'SKILL.md'), frontmatter);
    }

    return `Successfully installed ${domains.length} domain skills to ${baseSkillsDir}`;
  }

  // 2. Cursor IDE (.cursor/rules/weavetab-<domain>.mdc)
  else if (targetFramework === '.cursor') {
    const cursorRulesDir = path.join(projectRoot, '.cursor', 'rules');
    fs.mkdirSync(cursorRulesDir, { recursive: true });

    if (includeRouter) {
      const routerMdc = [
        "---",
        "description: Universal Agent Intent Decision Matrix for Weavetab MCP",
        "globs: *",
        "alwaysApply: false",
        "---",
        "",
        routerContent
      ].join('\n');
      fs.writeFileSync(path.join(cursorRulesDir, 'weavetab-router.mdc'), routerMdc);
    }

    for (const [domain, content] of Object.entries(domainBundles)) {
      const mdcContent = [
        "---",
        `description: Weavetab MCP operational rules for ${domain}`,
        "globs: *",
        "alwaysApply: false",
        "---",
        "",
        content
      ].join('\n');
      fs.writeFileSync(path.join(cursorRulesDir, `weavetab-${domain}.mdc`), mdcContent);
    }

    return `Successfully installed ${domains.length} Cursor rules to ${cursorRulesDir}`;
  }

  // 3. Cline (.clinerules single file)
  else if (targetFramework === '.clinerules') {
    const clineFile = path.join(projectRoot, '.clinerules');
    let combined = `\n\n# ====================================================\n# Weavetab MCP Skills (v${WEAVETAB_VERSION})\n# ====================================================\n\n`;
    if (includeRouter) {
      combined += routerContent + "\n\n";
    }
    for (const [domain, content] of Object.entries(domainBundles)) {
      combined += `\n\n# --- DOMAIN: ${domain.toUpperCase()} ---\n\n${content}\n`;
    }
    fs.appendFileSync(clineFile, combined);
    return `Successfully appended ${domains.length} domains to ${clineFile}`;
  }

  // 4. Windsurf IDE (.windsurf/rules/weavetab-<domain>.md)
  else if (targetFramework === '.windsurf') {
    const windsurfDir = path.join(projectRoot, '.windsurf', 'rules');
    fs.mkdirSync(windsurfDir, { recursive: true });

    if (includeRouter) {
      fs.writeFileSync(path.join(windsurfDir, 'weavetab-router.md'), routerContent);
    }

    for (const [domain, content] of Object.entries(domainBundles)) {
      fs.writeFileSync(path.join(windsurfDir, `weavetab-${domain}.md`), content);
    }
    return `Successfully installed ${domains.length} rules to ${windsurfDir}`;
  }

  // 5. OpenClaw (.openclaw/skills/weavetab-<domain>/SKILL.md)
  else if (targetFramework === '.openclaw') {
    const openClawDir = path.join(projectRoot, '.openclaw', 'skills');
    fs.mkdirSync(openClawDir, { recursive: true });

    for (const [domain, content] of Object.entries(domainBundles)) {
      const dir = path.join(openClawDir, `weavetab-${domain}`);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'SKILL.md'), content);
    }
    return `Successfully installed ${domains.length} skills to ${openClawDir}`;
  }

  // 6. RooCode (.roocode/rules/weavetab-<domain>.md)
  else if (targetFramework === '.roocode') {
    const rooDir = path.join(projectRoot, '.roocode', 'rules');
    fs.mkdirSync(rooDir, { recursive: true });

    for (const [domain, content] of Object.entries(domainBundles)) {
      fs.writeFileSync(path.join(rooDir, `weavetab-${domain}.md`), content);
    }
    return `Successfully installed ${domains.length} rules to ${rooDir}`;
  }

  // 7. Generic / Raw Markdown
  else {
    const genericDir = path.join(projectRoot, 'weavetab-skills');
    fs.mkdirSync(genericDir, { recursive: true });

    if (includeRouter) {
      fs.writeFileSync(path.join(genericDir, 'ROUTER.md'), routerContent);
    }

    for (const [domain, content] of Object.entries(domainBundles)) {
      fs.writeFileSync(path.join(genericDir, `weavetab-${domain}.md`), content);
    }
    return `Successfully installed ${domains.length} domain bundles to ${genericDir}`;
  }
}

module.exports = {
  WEAVETAB_VERSION,
  installSkills,
  getSkills,
  getSkill,
  getSkillsByDomain,
  getRouterMatrix,
  ALL_DOMAINS
};
