const fs = require('fs');
const path = require('path');

const localesDir = 'src/locales';

const descriptions = {
  en: "Experience the pinnacle of luxury car rentals. Unmatched performance, elegance, and dedicated service on every journey.",
  zh: "体验顶级豪华租车服务。在每一次旅程中体验无与伦比的性能、优雅和专注的服务。",
  ar: "جرب قمة استئجار السيارات الفاخرة. أداء لا مثيل له، وأناقة، وخدمة مخصصة في كل رحلة."
};

['en.json', 'ar.json', 'zh.json'].forEach(file => {
  const filePath = path.join(localesDir, file);
  if (!fs.existsSync(filePath)) return;
  const lang = file.split('.')[0];
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.footer) data.footer = {};
  data.footer.description = descriptions[lang];
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated description in ${file}`);
});
