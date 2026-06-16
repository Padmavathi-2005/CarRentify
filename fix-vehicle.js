const fs = require('fs');

const pageFile = 'g:/carental/frontend/src/app/vehicles/[slug]/page.tsx';
let content = fs.readFileSync(pageFile, 'utf8');

// 1. Add VerificationModal import
if (!content.includes('import VerificationModal')) {
    content = content.replace(
        'import PostBookingReviewModal from "@/components/VehicleDetail/PostBookingReviewModal";',
        'import PostBookingReviewModal from "@/components/VehicleDetail/PostBookingReviewModal";\nimport VerificationModal from "@/components/VerificationModal";'
    );
}

// 2. Change bookingError type and add showVerifModal
if (!content.includes('showVerifModal')) {
    content = content.replace(
        'const [bookingError, setBookingError] = useState("");',
        'const [bookingError, setBookingError] = useState<React.ReactNode>("");\n   const [showVerifModal, setShowVerifModal] = useState(false);'
    );
}

// 3. Update the handleBooking error
content = content.replace(
    'setBookingError("Your driver\'s license is missing or will expire before this trip ends. Please update it in your profile.");',
    `setBookingError(
            <span>
               Your driver's license is missing or will expire before this trip ends. Please <button onClick={() => setShowVerifModal(true)} className="underline hover:opacity-80">upload it here</button>.
            </span>
         );`
);

// 4. Add VerificationModal component to the bottom
if (!content.includes('<VerificationModal')) {
    content = content.replace(
        /<\/div>\s*\)\;\s*\}\s*$/,
        `         {user && (
            <VerificationModal
               isOpen={showVerifModal}
               onClose={() => setShowVerifModal(false)}
               userId={user._id || user.id || ''}
            />
         )}
      </div>
   );
}`
    );
}

fs.writeFileSync(pageFile, content, 'utf8');
console.log('Successfully patched vehicles/[slug]/page.tsx');
