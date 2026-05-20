const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Make create/edit view header responsive
const oldHeader = `<div className="flex items-center justify-between mb-8">`;
const newHeader = `<div className="flex flex-col sm:flex-row gap-6 sm:items-center justify-between mb-8">`;
content = content.replace(oldHeader, newHeader);

// 2. Make buttons container and buttons responsive
const oldButtonsContainer = `<div className="flex items-center gap-3">`;
const newButtonsContainer = `<div className="flex items-center gap-3 w-full sm:w-auto">`;
content = content.replace(oldButtonsContainer, newButtonsContainer);

// Make buttons take full width on mobile
const oldCancelButton = `variant="ghost" className="h-11 px-6`;
const newCancelButton = `variant="ghost" className="flex-1 sm:flex-none h-11 px-6`;
content = content.replace(oldCancelButton, newCancelButton);

const oldSaveButton = `className="bg-[var(--primary-brand-color)] hover:opacity-90 text-white px-8 h-11`;
const newSaveButton = `className="flex-1 sm:flex-none bg-[var(--primary-brand-color)] hover:opacity-90 text-white px-8 h-11`;
content = content.replace(oldSaveButton, newSaveButton);

// 3. Make the Governance card sticky only on desktop and clean up dark: typo
const oldSticky = `className="bg-[var(--admin-card-bg)] rounded-app p-8 border border-[var(--admin-border)] dark: sticky top-24"`;
const newSticky = `className="bg-[var(--admin-card-bg)] rounded-app p-8 border border-[var(--admin-border)] dark: lg:sticky lg:top-24"`;
content = content.replace(oldSticky, newSticky);

// 4. Move Info Block inside Right Column (by removing premature close tag of Right Column)
// Find the closing divs for button container, governance card, and Right Column
const oldCloseChainRegex = /<\/Button>\s*<\/div>\s*<\/div>\s*<\/div>\s*\r?\n\s*\r?\n\s*\{\/\* Info Block \*\/\}/;
// We replace it by keeping only two closing divs (button container, governance card), so Right Column remains open!
const newCloseChain = `</Button>
  </div>
  </div>

  {/* Info Block */}`;
content = content.replace(oldCloseChainRegex, newCloseChain);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated AdminCouponsView.tsx!');
