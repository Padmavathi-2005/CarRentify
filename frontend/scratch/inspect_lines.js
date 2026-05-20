const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);
for (let i = 495; i < Math.min(525, lines.length); i++) {
  console.log(`${i + 1}: [${lines[i]}]`);
}
