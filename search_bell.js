const fs = require('fs');
const path = require('path');
function searchDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
        searchDirectory(fullPath);
      }
    } else {
      const ext = path.extname(fullPath);
      if (['.ts', '.tsx', '.js', '.jsx', '.json'].includes(ext)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('🔔')) {
          console.log('Found in:', fullPath);
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('🔔')) {
              console.log(`Line ${i+1}: ${lines[i]}`);
            }
          }
        }
      }
    }
  }
}
searchDirectory('g:/carental');
