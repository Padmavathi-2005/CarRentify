const fs = require('fs');
const homeFile = 'g:/carental/frontend/src/views/HomeView.tsx';
let c = fs.readFileSync(homeFile, 'utf8');

// Replace the fallback for name from "Verified Client" to "User"
c = c.replace(
  /name: r\.user\?\.displayName \|\| \(r\.user\?\.firstName \? \(r\.user\.firstName \+ " " \+ \(r\.user\.lastName \|\| ""\)\)\.trim\(\) : "Verified Client"\)/g,
  `name: r.user?.displayName || (r.user?.firstName ? (r.user.firstName + " " + (r.user.lastName || "")).trim() : "User")`
);

fs.writeFileSync(homeFile, c);
console.log("Updated fallback to User");
