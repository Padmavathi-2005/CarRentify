const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// The end of the first return statement should have exactly:
//   </div>
//   </div>
//  </motion.div>
// Let's replace the corrupted three-div ending in the list view with the correct two-div ending:
const corruptedListEnd = `  </div>\r\n  </div>\r\n   </div>\r\n  </motion.div>`;
const corruptedListEndLF = `  </div>\n  </div>\n   </div>\n  </motion.div>`;
const correctListEnd = `  </div>\r\n  </div>\r\n  </motion.div>`;

if (content.includes(corruptedListEnd)) {
  content = content.replace(corruptedListEnd, correctListEnd);
} else if (content.includes(corruptedListEndLF)) {
  content = content.replace(corruptedListEndLF, correctListEnd);
} else {
  // Regex fallback: find the first occurrence of three divs and </motion.div> right around line 285-288
  // Since we know handleEdit is on line 273, let's search specifically for that region:
  content = content.replace(
    /(<\/button>\s*<\/div>\s*<\/td>\s*<\/tr>\s*\}\)\)\s*<\/tbody>\s*<\/table>\s*<\/div>\s*<\/div>\s*)<\/div>\s*<\/motion\.div>/,
    `$1</motion.div>`
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully fixed the list view return statement!');
