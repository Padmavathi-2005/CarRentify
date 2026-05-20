const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Make the Right Column parent container sticky
const oldColumn = `<div className="space-y-8">`;
const newColumn = `<div className="space-y-8 lg:sticky lg:top-24">`;
content = content.replace(oldColumn, newColumn);

// 2. Remove sticky from the Governance card itself
const oldSticky = `className="bg-[var(--admin-card-bg)] rounded-app p-8 border border-[var(--admin-border)] dark: lg:sticky lg:top-24"`;
const newSticky = `className="bg-[var(--admin-card-bg)] rounded-app p-8 border border-[var(--admin-border)] dark:"`;
content = content.replace(oldSticky, newSticky);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated AdminCouponsView.tsx sticky sidebar logic!');
