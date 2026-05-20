const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminVerificationView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add scroll lock useEffect
const oldEffectRegex = /useEffect\(\s*\(\s*\)\s*=>\s*\{\s*fetchSubmissions\(\s*\)\s*;\s*\}\s*,\s*\[\s*\]\s*\)\s*;?/g;
const newEffect = `useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (fullImageUrl) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [fullImageUrl]);`;
content = content.replace(oldEffectRegex, newEffect);

// 2. Remove the AnimatePresence inside the modal
const animatePresenceRegex = /<AnimatePresence>[\s\S]*?\{fullImageUrl\s*&&[\s\S]*?<\/AnimatePresence>/;
content = content.replace(animatePresenceRegex, '');

// 3. Wrap return in <> ... </> and append the AnimatePresence overlay at the end
const returnRegex = /return\s*\(\s*<motion\.div/;
content = content.replace(returnRegex, 'return (\r\n  <>\r\n  <motion.div');

const closeRegex = /<\/Modal>\s*<\/motion\.div>\s*\)\s*;\s*\}/;
const newClose = `</Modal>
  </motion.div>

  <AnimatePresence>
    {fullImageUrl && (
      <div className="fixed inset-0 z-[10000] bg-black/95 flex items-center justify-center p-4 lg:p-20 overflow-hidden">
        <div className="fixed inset-0" onClick={() => setFullImageUrl(null)} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          <img 
            src={fullImageUrl} 
            className="max-w-full max-h-[85vh] object-contain rounded-app " 
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            onClick={() => setFullImageUrl(null)}
            className="absolute -top-12 right-0 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all border border-white/20"
          >
            <XCircle size={20} />
          </button>
          <div className="absolute -bottom-12 left-0 right-0 text-center">
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Identity Evidence Full Specification • Secure View</p>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
  </>
  );
}`;
content = content.replace(closeRegex, newClose);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated AdminVerificationView.tsx!');
