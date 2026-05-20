const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Target the buttons container in the header uniquely using context
const oldButtonsBlockRegex = /<\/div>\s*<\/div>\s*<div className="flex items-center gap-3">\s*<Button onClick=\{\(\) => setView\("list"\)\}/;
const newButtonsBlock = `</div>
  </div>
  <div className="flex items-center gap-3 w-full sm:w-auto">
  <Button onClick={() => setView("list")}`;

if (oldButtonsBlockRegex.test(content)) {
  content = content.replace(oldButtonsBlockRegex, newButtonsBlock);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated AdminCouponsView.tsx header buttons wrapper!');
} else {
  console.log('Regex did not match!');
}
