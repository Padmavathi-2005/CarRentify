const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split(/\r?\n/);

// Find the line index of "{/* Info Block */}"
const startIndex = lines.findIndex(line => line.includes('{/* Info Block */}'));

// Find the line index of "</motion.div>"
const endIndex = lines.findIndex(line => line.includes('</motion.div>'));

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
  console.log(`Found {/* Info Block */} on line ${startIndex + 1}`);
  console.log(`Found </motion.div> on line ${endIndex + 1}`);
  
  // We remove all lines from startIndex up to endIndex (exclusive), and insert exactly two closing </div> tags
  const linesToRemove = endIndex - startIndex;
  lines.splice(startIndex, linesToRemove, '  </div>', '  </div>');
  
  fs.writeFileSync(path, lines.join('\r\n'), 'utf8');
  console.log('Successfully removed Info Block and balanced tags!');
} else {
  console.log('Could not find start or end index!');
}
