const fs = require('fs');
const path = require('path');

const checkoutPath = path.join(__dirname, 'frontend/src/app/checkout/page.tsx');
const modalPath = path.join(__dirname, 'frontend/src/components/CheckoutModal.tsx');

let content = fs.readFileSync(checkoutPath, 'utf8');

// 1. Remove "useSearchParams" and update imports
content = content.replace(/useSearchParams,\s*/, '');

// 2. Define Props
const propsDefinition = `
export interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialPickupTime?: string;
  initialReturnTime?: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  carId,
  initialStartDate,
  initialEndDate,
  initialPickupTime,
  initialReturnTime
}: CheckoutModalProps) {
`;

// Replace function CheckoutContent() { with propsDefinition
content = content.replace(/function CheckoutContent\(\) \{/, propsDefinition);

// 3. Remove searchParams definitions EXACTLY
content = content.replace('const searchParams = useSearchParams();', '');
content = content.replace('const carId = searchParams.get("carId");', '');

content = content.replace(/searchParams\.get\("start"\)/g, 'initialStartDate');
content = content.replace(/searchParams\.get\("end"\)/g, 'initialEndDate');
content = content.replace(/searchParams\.get\("pickup"\)/g, 'initialPickupTime');
content = content.replace(/searchParams\.get\("return"\)/g, 'initialReturnTime');

// 4. Patch verification check in handleConfirmPayment
content = content.replace(
  /\/\/ If not verified and user is not an admin, open modal instead of proceeding\s*if \(user\?\.role !== 'admin' && verificationStatus !== 'approved'\) \{\s*setShowVerifModal\(true\);\s*return;\s*\}/,
  `// If not verified, or license is expired/missing, open modal instead of proceeding
  if (user?.role !== 'admin') {
     const hasValidLicense = (user as any).licenseExpiryDate && new Date((user as any).licenseExpiryDate).getTime() >= new Date(initialEndDate || '').getTime();
     
     if (verificationStatus !== 'approved' || !hasValidLicense) {
        setShowVerifModal(true);
        return;
     }
  }`
);

// 5. Update the wrapper
content = content.replace(/<div className="min-h-screen bg-\[#F8FAFC\] font-sans selection:bg-primary selection:text-white">\s*<Header \/>\s*\{?\/\* Soft Verification Banner[\s\S]*?<main className="max-w-7xl mx-auto px-6 pt-24">/, 
`<>
<Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-7xl" noPadding={true}>
    <div className="bg-[#F8FAFC] font-sans selection:bg-primary selection:text-white max-h-[90vh] overflow-y-auto relative w-full">
        {user?.role !== 'admin' && verificationStatus !== 'loading' && verificationStatus !== 'approved' && (
            <div className={\`absolute top-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none\`}>
                <div className={\`pointer-events-auto flex items-center gap-4 px-6 py-3 rounded-app border text-[10px] font-bold uppercase tracking-widest \${
                    verificationStatus === 'pending'
                        ? 'bg-amber-50 border-amber-100 text-amber-600'
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                }\`}>
                    <ShieldCheck size={14} />
                    <span>
                        {verificationStatus === 'pending'
                            ? t('checkout.verification.review')
                            : verificationStatus === 'action_required'
                                ? "UPDATE REQUIRED: Missing new verification documents"
                                : t('checkout.verification.required')}
                    </span>
                    {verificationStatus !== 'pending' && (
                        <button
                            onClick={() => setShowVerifModal(true)}
                            className="ml-2 px-3 py-1 bg-rose-500 text-white rounded-app hover:bg-rose-600 transition-all"
                        >
                            {t('checkout.verification.verify_now')}
                        </button>
                    )}
                </div>
            </div>
        )}
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
`);

content = content.replace(/<\/main>\s*<Footer \/>/, '</div></div></Modal>');

// Fix the return wrapper ending.
content = content.replace(/<\/Modal>\s*<\/div>\s*\);\s*\}/, '</Modal>\n</>\n);\n}');

// Remove the default export and page component at the bottom
content = content.replace(/export default function CheckoutPage\(\) \{[\s\S]*$/, '');

fs.writeFileSync(modalPath, content, 'utf8');
console.log("Successfully created CheckoutModal.tsx with proper signature and verification patch");
