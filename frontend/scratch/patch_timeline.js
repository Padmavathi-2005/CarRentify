const fs = require('fs');
const path = 'g:/carental/frontend/src/app/dashboard/bookings/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const handoverTimelineSearch = /<p className="text-\[10px\] font-black text-slate-900 uppercase tracking-widest">Handover Process<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>/;

const returnStep = `
                             <div className="relative flex items-center gap-6">
                                <div className={\`w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white relative z-10 \${selectedBooking.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-50'}\`}>
                                   <History size={12} className={selectedBooking.status === 'Completed' ? 'text-white' : 'text-slate-200'} />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Return & Settlement</p>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                      {selectedBooking.status === 'Completed' ? 'Journey Successfully Concluded' : 'Post-trip Closure Protocol'}
                                   </p>
                                </div>
                             </div>`;

if (handoverTimelineRegex.test(content)) {
    // Wait, let's use a simpler match
}

// Re-try with literal but flexible spaces
const s = `                                   <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Handover Process</p>`;
if (content.includes(s)) {
    console.log("Found handover step...");
    // Find the end of the div containing this p
    const pIndex = content.indexOf(s);
    const divEndIndex = content.indexOf('</div>', content.indexOf('</div>', pIndex) + 1); // 2nd div end
    const outerDivEndIndex = content.indexOf('</div>', divEndIndex + 1); // 3rd div end
    
    const part1 = content.substring(0, outerDivEndIndex + 6);
    const part2 = content.substring(outerDivEndIndex + 6);
    
    content = part1 + returnStep + part2;
    fs.writeFileSync(path, content);
    console.log("Timeline updated.");
} else {
    console.log("Could not find timeline step.");
}
