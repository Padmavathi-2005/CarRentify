const fs = require('fs');
const homeFile = 'g:/carental/frontend/src/views/HomeView.tsx';
let c = fs.readFileSync(homeFile, 'utf8');

// Bypass fetch cache
c = c.replace(
  /fetch\(`\$\{API_BASE_URL\}\/reviews\/featured`\)/g,
  `fetch(\`\$\{API_BASE_URL\}/reviews/featured?t=\${Date.now()}\`)`
);

// Add carId mapping
c = c.replace(
  /carSlug: r\.car\?\.slug,/g,
  `carSlug: r.car?.slug,\n              carId: r.car?._id,`
);

// Update link to use carSlug or carId
c = c.replace(
  /\{t\.carSlug \? \(/g,
  `{(t.carSlug || t.carId) ? (`
);

c = c.replace(
  /<Link href=\{\`\/vehicles\/\$\{t\.carSlug\}\`\}>/g,
  `<Link href={\`/vehicles/\${t.carSlug || t.carId}\`}>`
);

fs.writeFileSync(homeFile, c);
console.log("Updated HomeView cache buster and carId link");
