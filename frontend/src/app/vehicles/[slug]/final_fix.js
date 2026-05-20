const fs = require('fs');
const path = 'g:/carental/frontend/src/app/vehicles/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update useAuth destructuring
content = content.replace(/const \{ user, setShowLoginModal \} = useAuth\(\);/, 'const { user, setShowLoginModal, logout } = useAuth();');

// 2. Add 401 handler without original alerts
const errorBlockTarget = /\} else \{\s+setBookingError\(data\.message \|\| "Registry synchronization failed\."\);/m;
const errorBlockReplacement = `} else if (res.status === 401) {
            alert("Your session has expired. Please log in again to checkout.");
            logout();
            setShowLoginModal(true);
         } else {
            setBookingError(data.message || "Registry synchronization failed.");`;

content = content.replace(errorBlockTarget, errorBlockReplacement);

// 3. Remove the redirection alert (if it exists)
content = content.replace(/alert\("Success! Transferring you to the secure checkout page\.\.\."\);/, '');

fs.writeFileSync(path, content);
console.log('Vehicle page fixed successfully.');
