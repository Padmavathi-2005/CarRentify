const fs = require('fs');
const path = 'g:/carental/frontend/src/app/dashboard/bookings/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const settlementLogic = `
                                             <input 
                                               type="number" 
                                               value={actionMileage}
                                               onChange={(e) => setActionMileage(Number(e.target.value))}
                                               className="w-full h-12 px-4 bg-white border border-slate-100 rounded-app text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                                             />
                                              {(() => {
                                                 const car = b.carId;
                                                 const start = new Date(\`\${b.startDate}T\${b.pickupTime}\`);
                                                 const end = new Date(\`\${b.endDate}T\${b.returnTime}\`);
                                                 const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                                 const includedDist = (car?.distanceIncluded || 200) * diffDays;
                                                 const travelled = actionMileage - (b.hostMileage || 0);
                                                 const extraMiles = Math.max(0, travelled - includedDist);
                                                 const settlement = extraMiles * (car?.extraDistanceFee || 0.5);
                                                 
                                                 if (actionMileage > (b.hostMileage || 0)) {
                                                     return (
                                                         <div className="mt-2 p-3 bg-primary/5 rounded-app border border-primary/10">
                                                             <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                                                 <span className="text-slate-400">Total Distance</span>
                                                                 <span className="text-slate-900">{travelled} km</span>
                                                                 <span className="ml-2 text-slate-300">({b.hostMileage} → {actionMileage})</span>
                                                             </div>
                                                             <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mt-1">
                                                                 <span className="text-slate-400">Included Distance</span>
                                                                 <span className="text-slate-900">{includedDist} km</span>
                                                             </div>
                                                             {extraMiles > 0 && (
                                                                 <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest mt-1 pt-1 border-t border-primary/10">
                                                                     <span className="text-primary">Extra Usage Settlement</span>
                                                                     <span className="text-primary font-bold">\${settlement.toFixed(2)}</span>
                                                                 </div>
                                                             )}
                                                         </div>
                                                     );
                                                 }
                                                 return null;
                                              })()}
`;

if (content.includes('value={actionMileage}') && content.includes('Return Protocol: Post-trip condition')) {
    console.log("Found return protocol section.");
    // We need to find the specific input after "Return Protocol"
    const startIdx = content.indexOf('Return Protocol: Post-trip condition');
    const inputIdx = content.indexOf('value={actionMileage}', startIdx);
    const divStartIdx = content.lastIndexOf('<input', inputIdx);
    const divEndIdx = content.indexOf('/>', inputIdx) + 2;
    
    const part1 = content.substring(0, divStartIdx);
    const part2 = content.substring(divEndIdx);
    
    content = part1 + settlementLogic + part2;
    fs.writeFileSync(path, content);
    console.log("Return settlement preview added.");
} else {
    console.log("Section not found.");
}
