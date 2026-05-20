const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert a closing </div> before </motion.div> to balance the Grid
content = content.replace('</div>\r\n </motion.div>', '</div>\r\n  </div>\r\n </motion.div>');
content = content.replace('</div>\n </motion.div>', '</div>\n  </div>\n </motion.div>');

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully added missing closing div!');
