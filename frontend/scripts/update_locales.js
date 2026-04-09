const fs = require('fs');
const path = require('path');

const localesDir = path.join('g:', 'carental', 'frontend', 'src', 'app', 'admin', 'locales');
const files = ['en.json', 'fr.json', 'ta.json', 'ar.json', 'zh.json'];

const translations = {
  en: { footer: "Footer Config", newsletter: "Newsletter Banner", social: "Social Links", links: "Quick Links", text: "Copyright & Text" },
  fr: { footer: "Config Pied de page", newsletter: "Bannière Newsletter", social: "Réseaux Sociaux", links: "Liens Rapides", text: "Texte & Copyright" },
  ta: { footer: "அடிக்குறிப்பு", newsletter: "செய்தி மடல்", social: "சமூக இணைப்புகள்", links: "விரைவான இணைப்புகள்", text: "பதிப்புரிமை" },
  ar: { footer: "إعدادات التذييل", newsletter: "بانر النشرة الإخبارية", social: "الروابط الاجتماعية", links: "روابط سريعة", text: "حقوق النشر" },
  zh: { footer: "页脚设置", newsletter: "通讯横幅", social: "社交链接", links: "快速链接", text: "版权与文本" }
};

for (const file of files) {
  const lang = file.split('.')[0];
  const filePath = path.join(localesDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!content.settings) content.settings = {};
  if (!content.settings.tabs) content.settings.tabs = {};
  
  content.settings.tabs.footer = translations[lang].footer;
  
  content.settings.footerTabs = {
    newsletter: translations[lang].newsletter,
    social: translations[lang].social,
    links: translations[lang].links,
    text: translations[lang].text
  };
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
}

console.log("Locales updated!");
