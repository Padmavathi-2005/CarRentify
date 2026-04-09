const fs = require('fs');
const path = require('path');

const sourceDir = path.join('g:', 'carental', 'frontend', 'src', 'app', 'p');
const targetDir = path.join('g:', 'carental', 'frontend', 'src', 'app', 'pages');

try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);
  for (const file of files) {
    const src = path.join(sourceDir, file);
    const dest = path.join(targetDir, file);
    
    if (fs.lstatSync(src).isDirectory()) {
       fs.renameSync(src, dest);
    } else {
       fs.copyFileSync(src, dest);
       fs.unlinkSync(src);
    }
  }
  
  fs.rmdirSync(sourceDir, { recursive: true });
  console.log('Successfully migrated /p/ to /pages/');
} catch (err) {
  console.error('Migration failed:', err.message);
}
