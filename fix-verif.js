const fs = require('fs');

const modalFile = 'g:/carental/frontend/src/components/VerificationModal.tsx';
let content = fs.readFileSync(modalFile, 'utf8');

// Update the status check to include action_required
const oldCondition = `) : status === "approved" || status === "rejected" ? (`;
const newCondition = `) : status === "approved" || status === "rejected" || status === "action_required" ? (`;
content = content.replace(oldCondition, newCondition);

// Update the banner styles and icons
const oldBanner = `className={\`rounded-app p-6 mb-6 flex items-start gap-4 \${status === 'approved' ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'}\`}
 >
 {status === 'approved' ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} /> : <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />}
 <div>
 <p className={\`text-[11px] font-black uppercase tracking-widest mb-1 \${status === 'approved' ? 'text-emerald-600' : 'text-rose-600'}\`}>
 {status === 'approved' ? t('dashboard.verification.verified') : t('dashboard.verification.rejected_reupload')}
 </p>
 <p className={\`text-sm font-bold \${status === 'approved' ? 'text-emerald-500/80' : 'text-rose-500/80'}\`}>
 {status === 'approved' ? t('dashboard.verification.confirmed_desc') : (myStatus?.adminNote || t('dashboard.verification.rejected'))}`;

const newBanner = `className={\`rounded-app p-6 mb-6 flex items-start gap-4 \${status === 'approved' ? 'bg-emerald-50 border border-emerald-100' : status === 'action_required' ? 'bg-amber-50 border border-amber-100' : 'bg-rose-50 border border-rose-100'}\`}
 >
 {status === 'approved' ? <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} /> : status === 'action_required' ? <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} /> : <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />}
 <div>
 <p className={\`text-[11px] font-black uppercase tracking-widest mb-1 \${status === 'approved' ? 'text-emerald-600' : status === 'action_required' ? 'text-amber-600' : 'text-rose-600'}\`}>
 {status === 'approved' ? t('dashboard.verification.verified') : status === 'action_required' ? 'Action Required' : t('dashboard.verification.rejected_reupload')}
 </p>
 <p className={\`text-sm font-bold \${status === 'approved' ? 'text-emerald-500/80' : status === 'action_required' ? 'Your driver\\'s license is missing or expired. Please update it below.' : 'text-rose-500/80'}\`}>
 {status === 'approved' ? t('dashboard.verification.confirmed_desc') : status === 'action_required' ? 'Please upload your new license or update your expiry date.' : (myStatus?.adminNote || t('dashboard.verification.rejected'))}`;

content = content.replace(oldBanner, newBanner);

fs.writeFileSync(modalFile, content, 'utf8');
console.log('Successfully patched VerificationModal.tsx');
