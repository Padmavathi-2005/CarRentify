const fs = require('fs');
const path = 'g:/carental/frontend/src/app/vehicles/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add debug alert to start of function
content = content.replace(/const handleBooking = async \(\) => \{/, 'const handleBooking = async () => {\n      alert("DEBUG: Global handleBooking called");');

// Add inline alert to button
content = content.replace(/onClick=\{handleBooking\}/, 'onClick={() => { alert("DEBUG: Button onClick fired"); handleBooking(); }}');

// Change button color to Red
content = content.replace(/bg-primary hover:bg-black/, 'bg-red-600 hover:bg-black');

fs.writeFileSync(path, content);
console.log('File patched successfully.');
