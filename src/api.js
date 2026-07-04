const fs = require('fs');
const path = require('path');

/**
 * Programmatically install Weavetab MCP skills into a target project.
 * 
 * @param {Object} options
 * @param {string} options.targetFramework - '.agents', '.cursor', '.clinerules', or 'generic'
 * @param {string[]} options.categories - Array of categories to install (e.g. ['general'])
 * @param {string} options.projectRoot - The root directory to install into (defaults to process.cwd())
 * @returns {Promise<string>} - A message indicating success and the path where skills were installed.
 */
async function installSkills({ targetFramework, categories, projectRoot = process.cwd() }) {
  const packageRoot = path.join(__dirname, '..');
  
  if (!categories || categories.length === 0) {
    throw new Error("No categories selected for installation.");
  }

  // Gather all markdown files from the selected categories
  let allMarkdownFiles = [];
  for (const category of categories) {
    const categoryDir = path.join(packageRoot, category);
    if (!fs.existsSync(categoryDir)) continue;
    
    const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      allMarkdownFiles.push({
        name: file,
        content: fs.readFileSync(path.join(categoryDir, file), 'utf8')
      });
    }
  }

  if (allMarkdownFiles.length === 0) {
    throw new Error("No skills found in the selected categories.");
  }

  // Process and inject based on the framework
  if (targetFramework === '.clinerules') {
    // Cline uses a single file at the root
    const clineFile = path.join(projectRoot, '.clinerules');
    let combinedContent = "\n\n# --- Weavetab MCP Skills ---\n\n";
    for (const file of allMarkdownFiles) {
      combinedContent += `## ${file.name}\n${file.content}\n\n`;
    }
    fs.appendFileSync(clineFile, combinedContent);
    return `Successfully appended ${allMarkdownFiles.length} skills to ${clineFile}`;
  } 
  
  else if (targetFramework === '.cursor') {
    // Cursor uses .mdc files in .cursor/rules
    const cursorRulesDir = path.join(projectRoot, '.cursor', 'rules');
    fs.mkdirSync(cursorRulesDir, { recursive: true });
    
    for (const file of allMarkdownFiles) {
      const destFile = path.join(cursorRulesDir, file.name.replace('.md', '.mdc'));
      fs.writeFileSync(destFile, file.content);
    }
    return `Successfully installed ${allMarkdownFiles.length} skills to ${cursorRulesDir}`;
  } 
  
  else if (targetFramework === '.agents') {
    // Standard agent customizations folder
    const agentsDir = path.join(projectRoot, '.agents', 'skills', 'weavetab');
    fs.mkdirSync(agentsDir, { recursive: true });
    
    for (const file of allMarkdownFiles) {
      fs.writeFileSync(path.join(agentsDir, file.name), file.content);
    }
    return `Successfully installed ${allMarkdownFiles.length} skills to ${agentsDir}`;
  } 
  
  else if (targetFramework === '.openclaw') {
    // OpenClaw AI folder
    const openClawDir = path.join(projectRoot, '.openclaw', 'skills');
    fs.mkdirSync(openClawDir, { recursive: true });
    
    for (const file of allMarkdownFiles) {
      fs.writeFileSync(path.join(openClawDir, file.name), file.content);
    }
    return `Successfully installed ${allMarkdownFiles.length} skills to ${openClawDir}`;
  } 
  
  else if (targetFramework === '.roocode') {
    const rooDir = path.join(projectRoot, '.roocode', 'rules');
    fs.mkdirSync(rooDir, { recursive: true });
    
    for (const file of allMarkdownFiles) {
      fs.writeFileSync(path.join(rooDir, file.name), file.content);
    }
    return `Successfully installed ${allMarkdownFiles.length} skills to ${rooDir}`;
  } 
  
  else if (targetFramework === '.windsurf') {
    const windsurfDir = path.join(projectRoot, '.windsurf', 'rules');
    fs.mkdirSync(windsurfDir, { recursive: true });
    
    for (const file of allMarkdownFiles) {
      fs.writeFileSync(path.join(windsurfDir, file.name), file.content);
    }
    return `Successfully installed ${allMarkdownFiles.length} skills to ${windsurfDir}`;
  } 
  
  else if (targetFramework === '.aider') {
    const aiderFile = path.join(projectRoot, '.aider.conf.yml');
    let combinedContent = "\n# --- Weavetab MCP Skills ---\n";
    for (const file of allMarkdownFiles) {
      // Very basic formatting for appending to Aider conf
      combinedContent += `# ${file.name}\n# ${file.content.split('\n').join('\n# ')}\n\n`;
    }
    fs.appendFileSync(aiderFile, combinedContent);
    return `Successfully appended ${allMarkdownFiles.length} skills to ${aiderFile}`;
  } 
  
  else {
    // Generic folder
    const genericDir = path.join(projectRoot, 'weavetab-skills');
    fs.mkdirSync(genericDir, { recursive: true });
    
    for (const file of allMarkdownFiles) {
      fs.writeFileSync(path.join(genericDir, file.name), file.content);
    }
    return `Successfully installed ${allMarkdownFiles.length} skills to ${genericDir}`;
  }
}

module.exports = { installSkills };
