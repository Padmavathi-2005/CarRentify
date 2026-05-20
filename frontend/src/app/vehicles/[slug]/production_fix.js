const fs = require('fs');
const path = 'g:/carental/frontend/src/app/vehicles/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Update useAuth destructuring to include logout
content = content.replace(/const \{ user, setShowLoginModal \} = useAuth\(\);/, 'const { user, setShowLoginModal, logout } = useAuth();');

// 2. Remove debug alerts from handleBooking
content = content.replace(/alert\("DEBUG: Global handleBooking called"\);/, '');
content = content.replace(/window\.alert\("System: Checkout Request Captured\. Starting Authorization\.\.\."\);/, '');

// 3. Implement 401 Session Expiry handling
content = content.replace(/\} else \{/, `} else if (res.status === 401) {
            alert("Your security session has expired. Please log in again.");
            logout();
            setShowLoginModal(true);
         } else {`);

// 4. Remove inline alert from button & revert to normal Button component
// First remove the patch from step 1201 (now line 1199 approx)
content = content.replace(/onClick=\{\(\) => \{ alert\("DEBUG: Button onClick fired"\); handleBooking\(\); \}\}/, 'onClick={handleBooking}');

// 5. Restore bg-primary
content = content.replace(/bg-red-600 hover:bg-black/, 'bg-primary hover:bg-black');

fs.writeFileSync(path, content);
console.log('Production fix applied successfully.');
