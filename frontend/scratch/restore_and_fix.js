const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Ensure the Governance card is closed correctly on line 505
// Let's find:
//   </Button>
//   </div>
//   </div>
//
//   {/* Info Block */}
// and replace it with:
//   </Button>
//   </div>
//   </div>
//   </div>
//
//   {/* Info Block */}
// This closes pt-6, space-y-6, and bg-[var(--admin-card-bg)] Governance card wrapper.
content = content.replace(
  /<\/Button>\s*<\/div>\s*<\/div>\s*\r?\n\s*\r?\n\s*\{\/\* Info Block \*\/\}/,
  `</Button>
  </div>
  </div>
  </div>

  {/* Info Block */}`
);

content = content.replace(
  /<\/Button>\s*<\/div>\s*<\/div>\s*\n\s*\n\s*\{\/\* Info Block \*\/\}/,
  `</Button>
  </div>
  </div>
  </div>

  {/* Info Block */}`
);

// 2. Ensure we have exactly six closing </div> tags at the end of the file (lines 518-523)
// Let's find:
//   </div>
//   </div>
//   </div>
//   </div>
//   </div>
//   </motion.div>
// and replace with:
//   </div>
//   </div>
//   </div>
//   </div>
//   </div>
//   </div>
//   </motion.div>
// Wait, let's check how many divs we have at the end of the file right now:
// Since we have five closing divs at the end of our current file:
//   </div>
//   </div>
//   </div>
//   </div>
//   </div>
//   </motion.div>
// If we closed Governance on line 505, then the five closing divs + one from Info Block (total 6) is already perfectly correct!
// Let's verify if the last block needs any adjustment:
// If the last block currently has 5 closing divs, then we can keep it as is, or replace it with the standard 6 closing divs.
// Let's clean up the end of the file to have exactly six closing </div> tags:
const oldEndRegex = /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/motion\.div>/;
const newEnd = `</div>
  </div>
  </div>
  </div>
  </div>
  </div>
  </motion.div>`;

content = content.replace(oldEndRegex, newEnd);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully restored and fixed AdminCouponsView.tsx HTML tags!');
