const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add ChevronDown and X to lucide-react imports
content = content.replace(
  '  Info\r\n} from "lucide-react";',
  '  Info,\r\n  ChevronDown,\r\n  X\r\n} from "lucide-react";'
);
content = content.replace(
  '  Info\n} from "lucide-react";',
  '  Info,\n  ChevronDown,\n  X\n} from "lucide-react";'
);

// 2. Add cars and users states after editingId
const stateInsertion = `  const [editingId, setEditingId] = useState<string | null>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);`;

content = content.replace(
  '  const [editingId, setEditingId] = useState<string | null>(null);',
  stateInsertion
);

// 3. Add fetch logic and hook integration
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

// We replace the original simple useEffect:
content = content.replace(
  `  useEffect(() => {
    fetchCoupons();
  }, []);`,
  fetchLogic
);

content = content.replace(
  `  useEffect(() => {
  fetchCoupons();
  }, []);`,
  fetchLogic
);

// 4. Replace the static placeholder divs with fully interactive dropdown multi-select elements
const oldPlaceholders = `  <div className="space-y-2">
  <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Only For Services</label>
  <div className="h-14 rounded-app bg-[var(--admin-bg)] flex items-center px-6 text-[var(--admin-text-muted)] text-xs font-bold italic">
  -- Select Services --
  </div>
  </div>
  <div className="space-y-2">
  <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Only For User</label>
  <div className="h-14 rounded-app bg-[var(--admin-bg)] flex items-center px-6 text-[var(--admin-text-muted)] text-xs font-bold italic">
  -- Select User --
  </div>
  </div>`;

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
  {user.displayName || \`\${user.firstName || ''} \${user.lastName || ''}\`.trim() || user.email} (\${user.email})
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

content = content.replace(oldPlaceholders, newInteractiveSelectors);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully completed selector logic implementation!');
