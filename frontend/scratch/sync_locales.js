const fs = require('fs');
const path = require('path');

const localesDir = 'src/locales';

const footerZh = {
  "ecosystem": "生态系统",
  "fleet": "我们的车队",
  "concierge": "礼宾服务",
  "pickup": "取车中心",
  "story": "关于故事",
  "info": "信息",
  "contact": "联系方式",
  "headquarters": "总部",
  "hq_loc": "英国伦敦梅费尔",
  "support": "支持中心",
  "privacy": "隐私政策",
  "security": "安全",
  "status": "状态",
  "newsletter": "时事通讯",
  "enter_email": "输入电子邮件地址...",
  "subscribe": "订阅",
  "wait": "请稍候...",
  "success_sub": "订阅成功！",
  "email_exists": "电子邮件已存在"
};

const bookingsZh = {
  "title": "我的预订",
  "subtitle": "管理您的即将到来和过去的租车体验。",
  "nav": {
    "dashboard": "控制面板",
    "fleet_bookings": "车队预订",
    "my_journeys": "我的行程"
  },
  "actions": {
    "view_journeys": "查看我的行程",
    "manage_fleet": "管理车队预订",
    "detail_view": "详情视图",
    "browse_fleet": "浏览高级车队",
    "cancel": "取消预订",
    "approve": "批准",
    "reject": "拒绝",
    "report_host": "举报车主",
    "accept_condition": "接受车况",
    "reject_condition": "拒绝车况",
    "verify_condition": "核实车况",
    "settle_payment": "结清余款"
  },
  "status": {
    "all": "全部",
    "pending": "已请求预订",
    "confirmed": "预订已确认",
    "active": "已取车",
    "completed": "行程已完成",
    "cancelled": "已取消",
    "rejected": "已拒绝",
    "booked_request": "预订请求",
    "ongoing_trip": "进行中的行程"
  },
  "labels": {
    "search": "搜索注册表...",
    "accessing": "正在访问注册表...",
    "premium_vehicle": "高级车辆",
    "updated": "更新于 {time}",
    "total_investment": "总投资",
    "booking_hash": "预订哈希",
    "showing_range": "显示 {start}–{end}，共 {total}",
    "empty_title": "注册表为空",
    "empty_desc": "您尚未发起任何高级行程。浏览我们的车队以寻找您的完美选择。",
    "invoice_title": "财务报表",
    "journey_manifesto": "行程清单"
  },
  "messages": {
    "cancel_confirm": "您确定要取消此预订吗？",
    "cancel_success": "预订取消成功。",
    "cancel_fail": "取消预订失败。",
    "approve_confirm": "批准此预订？",
    "approve_success": "预订已批准。",
    "reject_confirm": "拒绝此预订？",
    "reject_success": "预订已拒绝。",
    "condition_req": "请提供有效的里程和车况图像。",
    "condition_success": "车况已提交。客户已收到通知。",
    "accept_trip_confirm": "接受车况并开始行程？",
    "trip_started": "行程开始！祝您旅途愉快。",
    "reject_reason_prompt": "拒绝原因（例如：照片不清晰、里程表不匹配）：",
    "reject_success_notified": "车况已被拒绝。车主已收到重新提交的通知。",
    "report_host_prompt": "请提供您举报该车主的详细信息：",
    "host_reported": "车主已被举报。预订已取消并已全额退款。",
    "return_req": "请提供有效的归还里程和车况图像。",
    "return_success": "归还车况已提交。结算已计算。",
    "accept_settle_confirm": "接受归还车况并结清余款？",
    "trip_concluded": "行程已完成并结算。",
    "settle_success": "结算付款已成功完成！",
    "booking_payment_success": "预订付款已完成！",
    "settle_confirmed_concluded": "结算付款已确认，行程已结束！",
    "payment_successful": "付款成功！",
    "payment_verify_fail": "我们无法验证您的付款。如果问题仍然存在，请刷新或联系客服。"
  }
};

const footerAr = {
  "ecosystem": "النظام البيئي",
  "fleet": "أسطولنا",
  "concierge": "خدمة الكونسيرج",
  "pickup": "مراكز الاستلام",
  "story": "عن القصة",
  "info": "المعلومات",
  "contact": "اتصل بنا",
  "headquarters": "المقر الرئيسي",
  "hq_loc": "مايفير، لندن، المملكة المتحدة",
  "support": "مركز الدعم",
  "privacy": "الخصوصية",
  "security": "الأمان",
  "status": "الحالة",
  "newsletter": "النشرة الإخبارية",
  "enter_email": "أدخل عنوان البريد الإلكتروني...",
  "subscribe": "اشتراك",
  "wait": "انتظر...",
  "success_sub": "تم الاشتراك بنجاح!",
  "email_exists": "البريد الإلكتروني موجود بالفعل"
};

const bookingsAr = {
  "title": "حجوزاتي",
  "subtitle": "إدارة تجارب الاستئجار القادمة والسابقة.",
  "nav": {
    "dashboard": "لوحة القيادة",
    "fleet_bookings": "حجوزات الأسطول",
    "my_journeys": "رحلاتي"
  },
  "actions": {
    "view_journeys": "عرض رحلاتي",
    "manage_fleet": "إدارة حجوزات الأسطول",
    "detail_view": "عرض التفاصيل",
    "browse_fleet": "تصفح الأسطول المتميز",
    "cancel": "إلغاء الحجز",
    "approve": "موافقة",
    "reject": "رفض",
    "report_host": "إبلاغ عن المضيف",
    "accept_condition": "قبول الحالة",
    "reject_condition": "رفض الحالة",
    "verify_condition": "التحقق من الحالة",
    "settle_payment": "تسوية الدفع"
  },
  "status": {
    "all": "الكل",
    "pending": "طلب الحجز",
    "confirmed": "تم تأكيد الحجز",
    "active": "تم الاستلام",
    "completed": "اكتملت الرحلة",
    "cancelled": "ملغى",
    "rejected": "مرفوض",
    "booked_request": "طلب محجوز",
    "ongoing_trip": "رحلة جارية"
  },
  "labels": {
    "search": "بحث في السجل...",
    "accessing": "جاري الوصول إلى السجل...",
    "premium_vehicle": "سيارة متميزة",
    "updated": "تم التحديث {time}",
    "total_investment": "إجمالي الاستثمار",
    "booking_hash": "هاش الحجز",
    "showing_range": "عرض {start}–{end} من {total}",
    "empty_title": "السجل فارغ",
    "empty_desc": "لم تبدأ أي رحلات متميزة بعد. تصفح أسطولنا للعثور على سيارتك المثالية.",
    "invoice_title": "البيان المالي",
    "journey_manifesto": "مانيفستو الرحلة"
  },
  "messages": {
    "cancel_confirm": "هل أنت متأكد أنك تريد إلغاء هذا الحجز؟",
    "cancel_success": "تم إلغاء الحجز بنجاح.",
    "cancel_fail": "فشل إلغاء الحجز.",
    "approve_confirm": "الموافقة على هذا الحجز؟",
    "approve_success": "تمت الموافقة على الحجز.",
    "reject_confirm": "رفض هذا الحجز؟",
    "reject_success": "تم رفض الحجز.",
    "condition_req": "يرجى تقديم أميال صالحة وصورة للحالة.",
    "condition_success": "تم تقديم الحالة. تم إخطار العميل.",
    "accept_trip_confirm": "هل تقبل حالة السيارة وتبدأ الرحلة؟",
    "trip_started": "بدأت الرحلة! استمتع برحلتك.",
    "reject_reason_prompt": "سبب الرفض (مثلاً: الصورة غير واضحة، عدم تطابق عداد المسافات):",
    "reject_success_notified": "تم رفض الحالة. تم إخطار المضيف لإعادة التقديم.",
    "report_host_prompt": "يرجى تقديم تفاصيل عن سبب الإبلاغ عن هذا المضيف:",
    "host_reported": "تم الإبلاغ عن المضيف. تم إلغاء الحجز ومعالجة استرداد كامل المبلغ.",
    "return_req": "يرجى تقديم أميال عودة صالحة وصورة للحالة.",
    "return_success": "تم تقديم حالة العودة. تم حساب التسوية.",
    "accept_settle_confirm": "هل تقبل حالة العودة وتسوي الدفع؟",
    "trip_concluded": "اكتملت الرحلة وتمت التسوية.",
    "settle_success": "تم إكمال دفع التسوية بنجاح!",
    "booking_payment_success": "تم إكمال دفع الحجز!",
    "settle_confirmed_concluded": "تم تأكيد دفع التسوية وانتهت الرحلة!",
    "payment_successful": "تم الدفع بنجاح!",
    "payment_verify_fail": "لم نتمكن من التحقق من دفعتك. يرجى التحديث أو الاتصال بالدعم إذا استمرت المشكلة."
  }
};

const updateLocale = (file, footer, bookings) => {
  const filePath = path.join(localesDir, file);
  if (!fs.existsSync(filePath)) return;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  data.footer = footer;
  data.bookings = bookings;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${file}`);
};

updateLocale('zh.json', footerZh, bookingsZh);
updateLocale('ar.json', footerAr, bookingsAr);
