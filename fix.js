const fs = require('fs');

const file = 'g:/carental/frontend/src/components/CheckoutModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// The file currently lacks the router and variables because fuzzy replace deleted them!
// So let's just generate it fresh from checkout/page.tsx again.

const checkoutPath = 'g:/carental/frontend/src/app/checkout/page.tsx';
let orig = fs.readFileSync(checkoutPath, 'utf8');

// 1. Remove useSearchParams import
orig = orig.replace(/useSearchParams,\s*/, '');

const propsDefinition = \`
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
\`;

orig = orig.replace(/function CheckoutContent\(\) \{/, propsDefinition);

// Remove EXACT string blocks!
orig = orig.replace('const searchParams = useSearchParams();', '');
orig = orig.replace('const carId = searchParams.get("carId");', '');

orig = orig.replace(/searchParams\.get\("start"\)/g, 'initialStartDate');
orig = orig.replace(/searchParams\.get\("end"\)/g, 'initialEndDate');
orig = orig.replace(/searchParams\.get\("pickup"\)/g, 'initialPickupTime');
orig = orig.replace(/searchParams\.get\("return"\)/g, 'initialReturnTime');

orig = orig.replace(
  /if \\(user\\?\\.role !== 'admin' && verificationStatus !== 'approved'\\) \\{\\s*setShowVerifModal\\(true\\);\\s*return;\\s*\\}/,
  \`if (user?.role !== 'admin') {
     const hasValidLicense = (user as any).licenseExpiryDate && new Date((user as any).licenseExpiryDate).getTime() >= new Date(initialEndDate || '').getTime();
     
     if (verificationStatus !== 'approved' || !hasValidLicense) {
        setShowVerifModal(true);
        return;
     }
  }\`
);

orig = orig.replace(/<div className="min-h-screen bg-\\[#F8FAFC\\] font-sans selection:bg-primary selection:text-white">\\s*<Header \\/>\\s*\\{?\\/\\* Soft Verification Banner[\\s\\S]*?<main className="max-w-7xl mx-auto px-6 pt-24">/, 
\`<>
<Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-7xl" noPadding={true}>
    <div className="bg-[#F8FAFC] font-sans selection:bg-primary selection:text-white max-h-[90vh] overflow-y-auto relative w-full">
        {user?.role !== 'admin' && verificationStatus !== 'loading' && verificationStatus !== 'approved' && (
            <div className={\\\`absolute top-4 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none\\\`}>
                <div className={\\\`pointer-events-auto flex items-center gap-4 px-6 py-3 rounded-app border text-[10px] font-bold uppercase tracking-widest \\\${
                    verificationStatus === 'pending'
                        ? 'bg-amber-50 border-amber-100 text-amber-600'
                        : 'bg-rose-50 border-rose-100 text-rose-600'
                }\\\`}>
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
\`);

orig = orig.replace(/<\\/main>\\s*<Footer \\/>/, '</div></div></Modal>');
orig = orig.replace(/<\\/Modal>\\s*<\\/div>\\s*\\);\\s*\\}/, '</Modal>\\n</>\\n);\\n}');
orig = orig.replace(/export default function CheckoutPage\\(\\) \\{[\\s\\S]*$/, '');

fs.writeFileSync(file, orig, 'utf8');
console.log("Fixed CheckoutModal perfectly.");
