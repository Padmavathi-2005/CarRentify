const fs = require('fs');
const path = require('path');

const localesDir = 'src/locales';
const files = ['en.json', 'ar.json', 'zh.json'];

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  if (!fs.existsSync(filePath)) return;

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // We found that in some files, 'bookings' and 'dashboard' (the new one) 
    // are nested inside 'checkout' by mistake.
    
    if (data.checkout) {
      if (data.checkout.bookings) {
        data.bookings = data.checkout.bookings;
        delete data.checkout.bookings;
      }
      if (data.checkout.dashboard) {
        // Merge nested dashboard into top-level dashboard
        if (!data.dashboard) data.dashboard = {};
        data.dashboard = { ...data.dashboard, ...data.checkout.dashboard };
        delete data.checkout.dashboard;
      }
      if (data.checkout.sms_consent) {
        // Move sms_consent out or leave it? User usually expects it in checkout or common.
        // I'll move it to common if it's general, or keep in checkout if it's for payments.
        // Actually, let's just keep it in checkout but outside nested blocks.
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Fixed ${file}`);
  } catch (err) {
    console.error(`Error fixing ${file}:`, err);
  }
});
