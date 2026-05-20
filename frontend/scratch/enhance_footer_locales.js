const fs = require('fs');
const path = require('path');

const localesDir = 'src/locales';

const additions = {
  en: {
    help_center: "Help Center",
    faq: "FAQ",
    terms: "Terms of Service",
    cancellation: "Cancellation Policy",
    privacy_policy: "Privacy Policy"
  },
  zh: {
    help_center: "帮助中心",
    faq: "常见问题",
    terms: "服务条款",
    cancellation: "取消政策",
    privacy_policy: "隐私政策"
  },
  ar: {
    help_center: "مركز المساعدة",
    faq: "الأسئلة الشائعة",
    terms: "شروط الخدمة",
    cancellation: "سياسة الإلغاء",
    privacy_policy: "سياسة الخصوصية"
  }
};

['en.json', 'ar.json', 'zh.json'].forEach(file => {
  const filePath = path.join(localesDir, file);
  if (!fs.existsSync(filePath)) return;
  const lang = file.split('.')[0];
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.footer) data.footer = {};
  Object.assign(data.footer, additions[lang]);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Enhanced ${file}`);
});
