const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split(/\r?\n/);

// 1. Add ChevronDown and X to lucide-react imports (near lines 4-28)
const infoLineIdx = lines.findIndex(line => line.includes('  Info'));
if (infoLineIdx !== -1) {
  console.log(`Found Info import on line ${infoLineIdx + 1}`);
  lines[infoLineIdx] = '  Info,\r\n  ChevronDown,\r\n  X';
} else {
  throw new Error('Could not find Info import!');
}

// 2. Add cars and users states (after editingId)
const editingIdIdx = lines.findIndex(line => line.includes('editingId, setEditingId'));
if (editingIdIdx !== -1) {
  console.log(`Found editingId state on line ${editingIdIdx + 1}`);
  lines.splice(editingIdIdx + 1, 0, 
    '  const [cars, setCars] = useState<any[]>([]);',
    '  const [users, setUsers] = useState<any[]>([]);'
  );
} else {
  throw new Error('Could not find editingId state!');
}

// 3. Find useEffect containing fetchCoupons and add fetchCarsAndUsers
const fetchCouponsIdx = lines.findIndex(line => line.includes('fetchCoupons()'));
const useEffectStartIdx = lines.findIndex((line, idx) => idx < fetchCouponsIdx && line.includes('useEffect'));
const useEffectEndIdx = lines.findIndex((line, idx) => idx > fetchCouponsIdx && line.includes('}, []'));

if (useEffectStartIdx !== -1 && useEffectEndIdx !== -1) {
  console.log(`Found useEffect on lines ${useEffectStartIdx + 1} to ${useEffectEndIdx + 1}`);
  
  const fetchLogic = `  const fetchCarsAndUsers = async () => {
    try {
      const [carsRes, usersRes] = await Promise.all([
        fetch(\`\${API_BASE_URL}/cars\`),
        fetch(\`\${API_BASE_URL}/users\`, {
          headers: { Authorization: \`Bearer \${authService.getAdminToken()}\` }
        })
      ]);
      if (carsRes.ok) {
        const carsData = await carsRes.json();
        setCars(Array.isArray(carsData) ? carsData : []);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (err) {
      console.error("Fetch cars/users error:", err);
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchCarsAndUsers();
  }, []);`;
  
  // We replace the entire useEffect with fetchLogic
  const linesToRemove = (useEffectEndIdx - useEffectStartIdx) + 1;
  lines.splice(useEffectStartIdx, linesToRemove, fetchLogic);
} else {
  throw new Error('Could not find useEffect block!');
}

// 4. Find Only For Services and Only For User lines
const servicesLabelIdx = lines.findIndex(line => line.includes('Only For Services'));
const userLabelIdx = lines.findIndex(line => line.includes('Only For User'));

if (servicesLabelIdx !== -1 && userLabelIdx !== -1) {
  console.log(`Found Only For Services label on line ${servicesLabelIdx + 1}`);
  console.log(`Found Only For User label on line ${userLabelIdx + 1}`);
  
  // The first block starts at servicesLabelIdx - 1 (the wrapping <div className="space-y-2">)
  const startReplaceIdx = servicesLabelIdx - 1;
  
  // Let's find the closing tag of Only For User block (which ends with </div>)
  // Since we know the structure has:
  // <div className="space-y-2"> (userLabelIdx - 1)
  //   <label>Only For User</label>
  //   <div>-- Select User --</div>
  // </div>
  // The closing tag is at userLabelIdx + 3
  const endReplaceIdx = userLabelIdx + 3;
  
  const newInteractiveSelectors = `  <div className="space-y-2">
  <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Only For Cars (Services)</label>
  <div className="relative">
  <select 
  value="" 
  onChange={e => {
  const val = e.target.value;
  if (val && !formData.onlyForServices.includes(val)) {
  setFormData({
  ...formData,
  onlyForServices: [...formData.onlyForServices, val]
  });
  }
  }}
  className="w-full h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] px-6 focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer appearance-none text-xs"
  >
  <option value="">-- Add Applicable Cars --</option>
  {cars.map(car => (
  <option key={car._id || car.id} value={car._id || car.id}>
  {car.brand?.name || car.brand || 'Car'} {car.model} ({car.year})
  </option>
  ))}
  </select>
  <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
  <ChevronDown size={18} />
  </div>
  </div>
  
  {formData.onlyForServices.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-2">
  {formData.onlyForServices.map(id => {
  const car = cars.find(c => (c._id || c.id) === id);
  return (
  <div key={id} className="flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider pl-3 pr-2 py-1.5 rounded-app border border-primary/20">
  <span>{car ? \`\${car.brand?.name || car.brand || ''} \${car.model}\` : id}</span>
  <button 
  type="button"
  onClick={() => {
  setFormData({
  ...formData,
  onlyForServices: formData.onlyForServices.filter(item => item !== id)
  });
  }}
  className="hover:bg-primary/20 p-0.5 rounded-full transition-colors flex items-center justify-center text-primary"
  >
  <X size={12} />
  </button>
  </div>
  );
  })}
  </div>
  )}
  </div>

  <div className="space-y-2">
  <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Only For User</label>
  <div className="relative">
  <select 
  value="" 
  onChange={e => {
  const val = e.target.value;
  if (val && !formData.onlyForUsers.includes(val)) {
  setFormData({
  ...formData,
  onlyForUsers: [...formData.onlyForUsers, val]
  });
  }
  }}
  className="w-full h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] px-6 focus:ring-2 focus:ring-primary/20 transition-all outline-none cursor-pointer appearance-none text-xs"
  >
  <option value="">-- Add Restrained Users --</option>
  {users.map(user => (
  <option key={user._id || user.id} value={user._id || user.id}>
  {user.displayName || \`\${user.firstName || ''} \${user.lastName || ''}\`.trim() || user.email} (\&nbsp;\${user.email}\&nbsp;)
  </option>
  ))}
  </select>
  <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
  <ChevronDown size={18} />
  </div>
  </div>
  
  {formData.onlyForUsers.length > 0 && (
  <div className="flex flex-wrap gap-2 mt-2">
  {formData.onlyForUsers.map(id => {
  const user = users.find(u => (u._id || u.id) === id);
  return (
  <div key={id} className="flex items-center gap-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider pl-3 pr-2 py-1.5 rounded-app border border-primary/20">
  <span>{user ? (user.displayName || \`\${user.firstName || ''} \${user.lastName || ''}\`.trim() || user.email) : id}</span>
  <button 
  type="button"
  onClick={() => {
  setFormData({
  ...formData,
  onlyForUsers: formData.onlyForUsers.filter(item => item !== id)
  });
  }}
  className="hover:bg-primary/20 p-0.5 rounded-full transition-colors flex items-center justify-center text-primary"
  >
  <X size={12} />
  </button>
  </div>
  );
  })}
  </div>
  )}
  </div>`;
  
  const linesToRemove = (endReplaceIdx - startReplaceIdx) + 1;
  lines.splice(startReplaceIdx, linesToRemove, newInteractiveSelectors);
} else {
  throw new Error('Could not find Only For Services/User labels!');
}

fs.writeFileSync(path, lines.join('\r\n'), 'utf8');
console.log('Successfully applied all changes robustly!');
