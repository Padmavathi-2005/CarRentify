const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split(/\r?\n/);

const startIndex = lines.findIndex(line => line.includes('Info Block'));
const endIndex = lines.findIndex(line => line.includes('</motion.div>'));

console.log('startIndex:', startIndex);
console.log('endIndex:', endIndex);

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
  // We remove all lines from startIndex up to endIndex (exclusive), and insert exactly two closing </div> tags
  const linesToRemove = endIndex - startIndex;
  lines.splice(startIndex, linesToRemove, '  </div>', '  </div>');
  
  fs.writeFileSync(path, lines.join('\r\n'), 'utf8');
  console.log('Successfully removed Info Block and balanced tags!');
} else {
  console.log('Could not find start or end index!');
}
