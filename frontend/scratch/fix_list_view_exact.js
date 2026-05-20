const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split(/\r?\n/);

// Let's inspect the lines around index 286 (which is line 287 in 1-based indexing)
console.log('Line 285:', lines[284]); // 1-indexed line 285
console.log('Line 286:', lines[285]); // 1-indexed line 286
console.log('Line 287:', lines[286]); // 1-indexed line 287
console.log('Line 288:', lines[287]); // 1-indexed line 288
console.log('Line 289:', lines[288]); // 1-indexed line 289

// We want to delete line 287 if it is a closing div and line 288 is </motion.div>
if (lines[286].includes('</div>') && lines[287].includes('</motion.div>')) {
  console.log('Removing line 287...');
  lines.splice(286, 1); // Delete 1 line at index 286
}

fs.writeFileSync(path, lines.join('\r\n'), 'utf8');
console.log('Successfully completed line-based modification!');
