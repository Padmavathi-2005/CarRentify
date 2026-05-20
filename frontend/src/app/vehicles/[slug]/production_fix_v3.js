const fs = require('fs');
const path = 'g:/carental/frontend/src/app/vehicles/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Use Regex to be whitespace insensitive
const regex = /\} else \{\s+setBookingError\(data\.message \|\| "Registry synchronization failed\."\);/m;

const replacement = `} else if (res.status === 401) {
            alert("Your session has expired. Please log in again to checkout.");
            logout();
            setShowLoginModal(true);
         } else {
            setBookingError(data.message || "Registry synchronization failed.");`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    console.log('Regex Replacement Successful.');
} else {
    console.log('Regex NOT matched.');
}

fs.writeFileSync(path, content);
