const fs = require('fs');

// 1. Update HomeView.tsx
const homeFile = 'g:/carental/frontend/src/views/HomeView.tsx';
let c = fs.readFileSync(homeFile, 'utf8');

c = c.replace(
  /name: r\.user\?\.displayName \|\| \(r\.user\?\.firstName \? \(r\.user\.firstName \+ " " \+ \(r\.user\.lastName \|\| ""\)\)\.trim\(\) : "Verified Client"\),[\s\S]*?role: r\.car \? `Rented \$\{r\.car\.brandName \|\| ''\} \$\{r\.car\.model \|\| r\.car\.name\}`\.trim\(\) : "Verified Client",/g,
  `name: r.user?.displayName || (r.user?.firstName ? (r.user.firstName + " " + (r.user.lastName || "")).trim() : "Verified Client"),\n              role: r.car ? \`Rented \${r.car.brandName || ''} \${r.car.model || r.car.name}\`.trim() : "Verified Client",\n              carSlug: r.car?.slug,`
);

c = c.replace(
  /<div className="text-\[10px\] text-muted-foreground truncate">\{t\.role\}<\/div>/g,
  `{t.carSlug ? (
                      <Link href={\`/vehicles/\${t.carSlug}\`}>
                        <div className="text-[10px] text-primary hover:underline truncate cursor-pointer">{t.role}</div>
                      </Link>
                    ) : (
                      <div className="text-[10px] text-muted-foreground truncate">{t.role}</div>
                    )}`
);

fs.writeFileSync(homeFile, c);
console.log("Updated HomeView.tsx");

// 2. Update reviews.service.ts
const reviewFile = 'g:/carental/backend/src/reviews/reviews.service.ts';
let r = fs.readFileSync(reviewFile, 'utf8');
r = r.replace(
  /\.populate\('car', 'name images'\)/g,
  `.populate('car', 'name images slug brandName model')`
);
fs.writeFileSync(reviewFile, r);
console.log("Updated reviews.service.ts");
