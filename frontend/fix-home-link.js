const fs = require('fs');
const file = 'g:/carental/frontend/src/views/HomeView.tsx';
let c = fs.readFileSync(file, 'utf8');

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

fs.writeFileSync(file, c);
console.log("Done fixing HomeView.tsx");
