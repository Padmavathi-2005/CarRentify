const fs = require('fs');
const path = require('path');

const localesDir = 'src/locales';

const copyrights = {
  en: "© {year} CarRental. All rights reserved.",
  zh: "© {year} CarRental。版权所有。",
  ar: "© {year} CarRental. جميع الحقوق محفوظة."
};

['en.json', 'ar.json', 'zh.json'].forEach(file => {
  const filePath = path.join(localesDir, file);
  if (!fs.existsSync(filePath)) return;
  const lang = file.split('.')[0];
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.footer) data.footer = {};
  data.footer.copyright = copyrights[lang];
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated copyright in ${file}`);
});
