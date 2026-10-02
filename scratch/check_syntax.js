const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let errors = 0;
let checked = 0;

function checkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        checkDir(full);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.cjs') || entry.name.endsWith('.mjs'))) {
      checked++;
      try {
        execSync(`node --check "${full}"`, { stdio: 'pipe' });
        console.log(`[OK] ${full}`);
      } catch (err) {
        errors++;
        console.error(`[SYNTAX ERROR] ${full}:`, err.stderr.toString());
      }
    }
  }
}

console.log('Checking backend files...');
checkDir(path.resolve(__dirname, '../backend'));

console.log(`\nSyntax check completed. Checked: ${checked}, Errors: ${errors}`);
