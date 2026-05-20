const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// We currently have:
//   </div>
//   </div>
//   </div>
//   </div>
//   </div>
//   </div>
//   </motion.div>
// Let's replace it with exactly five closing divs after line 520 (which is also a closing div, making 6 total closing divs):
const oldEnd = `  </div>\r\n   </div>\r\n   </div>\r\n   </div>\r\n   </div>\r\n   </div>\r\n   </motion.div>`;
const newEnd = `  </div>\r\n   </div>\r\n   </div>\r\n   </div>\r\n   </div>\r\n   </motion.div>`;

const oldEndLF = `  </div>\n   </div>\n   </div>\n   </div>\n   </div>\n   </div>\n   </motion.div>`;
const newEndLF = `  </div>\n   </div>\n   </div>\n   </div>\n   </div>\n   </motion.div>`;

if (content.includes(oldEnd)) {
  content = content.replace(oldEnd, newEnd);
} else if (content.includes(oldEndLF)) {
  content = content.replace(oldEndLF, newEndLF);
} else {
  // Fallback regex replacement to remove one extra closing div before </motion.div>
  content = content.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/motion\.div>/, `</div>
  </div>
  </div>
  </div>
  </div>
  </motion.div>`);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully removed the extra closing div!');
