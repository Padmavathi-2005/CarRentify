const fs = require('fs');
const path = 'g:/carental/frontend/src/app/vehicles/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `         const data = await res.json();
         if (res.ok) {`;

const replacement = `         const data = await res.json();
         if (res.ok) {`;

// Let's find the specific error block
const errorBlockTarget = `         } else {
            setBookingError(data.message || "Registry synchronization failed.");`;

const errorBlockReplacement = `         } else if (res.status === 401) {
            alert("Your session has expired. Please log in again to checkout.");
            logout();
            setShowLoginModal(true);
         } else {
            setBookingError(data.message || "Registry synchronization failed.");`;

if (content.indexOf(errorBlockTarget) !== -1) {
    content = content.replace(errorBlockTarget, errorBlockReplacement);
    console.log('Error block replaced.');
} else {
    console.log('Error block NOT found.');
}

fs.writeFileSync(path, content);
