const fs = require('fs');
const path = require('path');

const packageRoot = path.join(__dirname, '..');
const DOMAINS = [
  'browser', 'desktop', 'memory', 'resilience', 'security',
  'plugins', 'network-and-perf', 'documents', 'developer'
];

// Tokens that were hallucinated / drifted out of the docs during earlier audits.
// If any of these reappear, the docs have regressed away from the MCP source of truth.
const DENYLIST = [
  { token: 'clickCount', reason: 'browser_click has no clickCount param' },
  { token: 'includeOffscreen', reason: 'browser_map has no includeOffscreen param' },
  { token: 'maxDepth', reason: 'browser_map has no maxDepth param' },
  { token: 'jsHeapUsedSizeMb', reason: 'browser_performance memory is byte fields, not *Mb' },
  { token: 'jsHeapTotalSizeMb', reason: 'browser_performance memory is byte fields, not *Mb' },
  { token: 'STALE_ELEMENT_REFERENCE', reason: 'real codes are ELEMENT_NOT_FOUND / FINGERPRINT_MISMATCH' },
  { token: 'NODE_DETACHED', reason: 'real codes are ELEMENT_NOT_FOUND / FINGERPRINT_MISMATCH' },
  { token: 'parameterizeInputs', reason: 'macro compilation reuses original args verbatim' },
  { token: 'values[]', reason: 'browser_select takes a singular value; multi-select is one call per option' },
  { token: 'policy.json', reason: 'domain policy is enforced via config, not a policy.json file' },
  { token: 'audit.log', reason: 'audit trail is logged as mission_<ts>.log' }
];

// Positive guards: each doc must document these real identifiers.
const REQUIRED = [
  { file: ['security', 'secret-containment-protocol.md'], token: 'envKey' },
  { file: ['resilience', 'stale-ref-recovery.md'], token: 'ELEMENT_NOT_FOUND' },
  { file: ['network-and-perf', 'performance-and-vitals.md'], token: 'usedJSHeapSize' }
];

function listMarkdownFiles() {
  const files = [];
  for (const domain of DOMAINS) {
    const dir = path.join(packageRoot, domain);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.md')) files.push(path.join(dir, f));
    }
  }
  for (const root of ['ROUTER.md', 'README.md']) {
    const p = path.join(packageRoot, root);
    if (fs.existsSync(p)) files.push(p);
  }
  return files;
}

function extractFromMCP() {
  const candidates = [
    path.join(packageRoot, '..', 'MCP', 'src', 'server.ts'),
    path.join(packageRoot, '..', '..', 'MCP', 'src', 'server.ts')
  ];
  const serverPath = candidates.find(p => fs.existsSync(p));
  if (!serverPath) return null;
  const text = fs.readFileSync(serverPath, 'utf8');
  const names = new Set();
  for (const m of text.matchAll(/server\.tool\(\s*"([a-z_]+)"/g)) names.add(m[1]);
  return { serverPath, names };
}

let failed = 0;
const errors = [];

console.log('Verifying skills docs against MCP source of truth...\n');

// 1. Denylist scan
const mdFiles = listMarkdownFiles();
for (const file of mdFiles) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const { token, reason } of DENYLIST) {
      if (line.includes(token)) {
        errors.push(`${path.relative(packageRoot, file)}:${idx + 1} references '${token}' (${reason})`);
        failed++;
      }
    }
  });
}
console.log(`  [1/3] Denylist scan      ${failed === 0 ? 'PASS' : 'FAIL'} (${mdFiles.length} files)`);

// 2. Required-identifier guards
let reqFailed = 0;
for (const { file, token } of REQUIRED) {
  const p = path.join(packageRoot, ...file);
  if (!fs.existsSync(p) || !fs.readFileSync(p, 'utf8').includes(token)) {
    errors.push(`${file.join('/')} does not document required identifier '${token}'`);
    reqFailed++;
    failed++;
  }
}
console.log(`  [2/3] Required identifiers ${reqFailed === 0 ? 'PASS' : 'FAIL'}`);

// 3. Tool-name parity with MCP server (only when source is present)
const mcp = extractFromMCP();
let parityOk = true;
if (!mcp) {
  console.log('  [3/3] Tool-name parity   SKIP (MCP source not found; published package)');
} else {
  const buildSrc = fs.readFileSync(path.join(__dirname, 'build.js'), 'utf8');
  const block = buildSrc.match(/const OFFICIAL_TOOLS = new Set\(\[([\s\S]*?)\]\);/);
  const declared = new Set([...(block ? block[1] : '').matchAll(/"(browser_[a-z_]+)"/g)].map(m => m[1]));
  const missingInBuild = [...mcp.names].filter(n => !declared.has(n));
  const extraInBuild = [...declared].filter(n => !mcp.names.has(n));
  if (missingInBuild.length || extraInBuild.length) {
    parityOk = false;
    failed++;
    if (missingInBuild.length) errors.push(`build.js OFFICIAL_TOOLS missing MCP tools: ${missingInBuild.join(', ')}`);
    if (extraInBuild.length) errors.push(`build.js OFFICIAL_TOOLS lists unknown tools: ${extraInBuild.join(', ')}`);
  }
  console.log(`  [3/3] Tool-name parity   ${parityOk ? 'PASS' : 'FAIL'} (${mcp.names.size} MCP tools)`);
}

console.log('');
if (failed > 0) {
  console.error(`Doc verification failed (${failed} issue${failed === 1 ? '' : 's'}):`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}
console.log('Doc verification passed.');
