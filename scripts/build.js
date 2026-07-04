const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const dirs = ['general', 'automation', 'advanced'];
const skills = [];

function parseFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  
  const frontmatter = yaml.parse(match[1]);
  
  // Convert absolute path to relative path
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  
  return {
    ...frontmatter,
    filePath: relativePath.replace(/\\/g, '/')
  };
}

for (const dir of dirs) {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) continue;
  
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md') && f !== 'README.md');
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    try {
      const parsed = parseFile(fullPath);
      if (parsed) {
        skills.push(parsed);
      }
    } catch (e) {
      console.error(`Error parsing ${fullPath}: ${e.message}`);
      process.exit(1);
    }
  }
}

fs.writeFileSync(
  path.join(__dirname, '..', 'skills.json'), 
  JSON.stringify({ skills }, null, 2)
);

console.log(`Successfully built skills.json with ${skills.length} skills.`);
