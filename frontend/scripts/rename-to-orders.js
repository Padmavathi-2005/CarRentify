const fs = require('fs');
const path = require('path');

const filePath = path.join('g:', 'carental', 'frontend', 'src', 'app', 'dashboard', 'orders', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replacements
content = content.replace(/booking/g, 'order');
content = content.replace(/Booking/g, 'Order');
content = content.replace(/carId/g, 'productId');
content = content.replace(/car/g, 'product');
content = content.replace(/Car/g, 'Product');
content = content.replace(/host/g, 'seller');
content = content.replace(/renter/g, 'buyer');

// Fix some specific strings that might be over-replaced or need special casing
content = content.replace(/MyOrderssPage/g, 'MyOrdersPage');
content = content.replace(/MyOrderssContent/g, 'MyOrdersContent');
content = content.replace(/orderType/g, 'orderType');
content = content.replace(/orderHash/g, 'orderHash');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored terminology in page.tsx');
