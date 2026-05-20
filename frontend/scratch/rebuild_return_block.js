const fs = require('fs');
const path = 'g:/carental/frontend/src/admin/views/AdminCouponsView.tsx';
let content = fs.readFileSync(path, 'utf8');

const lines = content.split(/\r?\n/);

// Find the start of the second return statement
const secondReturnIdx = lines.findIndex((line, idx) => idx > 310 && line.trim() === 'return (');

if (secondReturnIdx !== -1) {
  console.log(`Found second return at line ${secondReturnIdx + 1}`);
  
  const lastClosingBraceIdx = lines.length - 1; 
  
  const newReturnBlock = `  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => setView("list")} className="w-10 h-10 rounded-app bg-[var(--admin-card-bg)] border border-[var(--admin-border)] flex items-center justify-center text-[var(--admin-text-muted)] hover:text-primary transition-all active:scale-95">
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-[var(--admin-text-main)] tracking-tight uppercase">{view === "create" ? "Add New Coupon" : "Modify Protocol"}</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-[0.2em]">Coupon Design System</p>
              <div className="w-1 h-1 rounded-full bg-[var(--admin-border)]" />
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{view === "create" ? "Fresh Entry" : "Update Existing"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setView("list")} variant="ghost" className="h-11 px-6 rounded-app text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Cancel</Button>
          <Button onClick={handleSave} className="bg-[var(--primary-brand-color)] hover:opacity-90 text-white px-8 h-11 rounded-app font-black uppercase tracking-widest text-[11px] transition-all flex items-center gap-2 active:scale-95 border-none">
            <ShieldCheck size={16} /> Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* General Section */}
          <div className="bg-[var(--admin-card-bg)] rounded-app p-8 border border-[var(--admin-border)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none text-[var(--admin-text-main)]">
              <Ticket size={120} />
            </div>
            
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--admin-border)] pb-6">
              <div className="w-10 h-10 rounded-app bg-[var(--admin-bg)] border border-[var(--admin-border)] flex items-center justify-center text-primary"><Tag size={20} /></div>
              <h3 className="text-sm font-black text-[var(--admin-text-main)] uppercase tracking-widest">General Core</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Coupon Code <span className="text-rose-500">*</span></label>
                <Input 
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. SUMMER24" 
                  className="h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] px-6 focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Coupon Name</label>
                <Input 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Describe the campaign" 
                  className="h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] px-6 focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Coupon Amount <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Input 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    type="number" 
                    className="h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] pl-14 pr-6 focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]">
                    {formData.discountType === 'percentage' ? <Percent size={18} /> : <DollarSign size={18} />}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Discount Type</label>
                <select 
                  value={formData.discountType}
                  onChange={e => setFormData({...formData, discountType: e.target.value})}
                  className="w-full h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] px-6 focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="amount">Fixed Amount</option>
                  <option value="percentage">Percentage OFF</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1 flex items-center gap-2">
                  <CalendarIcon size={12} /> End Date
                </label>
                <Input 
                  type="date" 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className="h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] px-6 focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
            </div>
          </div>

          {/* Usage Restriction */}
          <div className="bg-[var(--admin-card-bg)] rounded-app p-8 border border-[var(--admin-border)]">
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--admin-border)] pb-6">
              <div className="w-10 h-10 rounded-app bg-amber-50 text-amber-500 flex items-center justify-center"><AlertCircle size={20} /></div>
              <h3 className="text-sm font-black text-[var(--admin-text-main)] uppercase tracking-widest">Usage Restriction</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Minimum Spend</label>
                <div className="relative">
                  <Input 
                    value={formData.minSpend}
                    onChange={e => setFormData({...formData, minSpend: Number(e.target.value)})}
                    placeholder="No Minimum" 
                    className="h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] px-6 focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">USD</div>
                </div>
                <p className="text-[9px] font-bold text-[var(--admin-text-muted)] px-1 mt-1 uppercase">Does not include booking fees</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Maximum Spend</label>
                <div className="relative">
                  <Input 
                    value={formData.maxSpend}
                    onChange={e => setFormData({...formData, maxSpend: Number(e.target.value)})}
                    placeholder="No Maximum" 
                    className="h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] px-6 focus:ring-2 focus:ring-primary/20 transition-all" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">USD</div>
                </div>
                <p className="text-[9px] font-bold text-[var(--admin-text-muted)] px-1 mt-1 uppercase">Does not include booking fees</p>
              </div>

              <div className="space-y-2">
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
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="bg-[var(--admin-card-bg)] rounded-app p-8 border border-[var(--admin-border)]">
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--admin-border)] pb-6">
              <div className="w-10 h-10 rounded-app bg-indigo-50 text-indigo-500 flex items-center justify-center"><ShoppingBag size={20} /></div>
              <h3 className="text-sm font-black text-[var(--admin-text-main)] uppercase tracking-widest">Usage Limits</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Usage Limit per Coupon</label>
                <Input 
                  value={formData.usageLimit}
                  onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})}
                  placeholder="Unlimited Usage" 
                  className="h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] px-6 focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1">Usage Limit Per User</label>
                <Input 
                  value={formData.userLimit}
                  onChange={e => setFormData({...formData, userLimit: Number(e.target.value)})}
                  placeholder="Unlimited Usage" 
                  className="h-14 rounded-app bg-[var(--admin-bg)] border-none font-black text-[var(--admin-text-main)] px-6 focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Publish Sidebar Block */}
          <div className="bg-[var(--admin-card-bg)] rounded-app p-8 border border-[var(--admin-border)] lg:sticky lg:top-24">
            <div className="flex items-center gap-3 mb-8 border-b border-[var(--admin-border)] pb-6">
              <div className="w-10 h-10 rounded-app bg-purple-50 text-purple-600 flex items-center justify-center"><Globe size={20} /></div>
              <h3 className="text-sm font-black text-[var(--admin-text-main)] uppercase tracking-widest">Governance</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest px-1 block">Publish Stage</label>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setFormData({...formData, status: "publish"})}
                    className={\`h-14 px-6 rounded-app border-2 transition-all flex items-center gap-3 font-black text-xs uppercase \\\${formData.status === 'publish' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 'bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:border-primary/20'}\`}
                  >
                    <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center \\\${formData.status === 'publish' ? 'border-emerald-500' : 'border-[var(--admin-border)]'}\`}>
                      {formData.status === 'publish' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                    </div>
                    Publish
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, status: "draft"})}
                    className={\`h-14 px-6 rounded-app border-2 transition-all flex items-center gap-3 font-black text-xs uppercase \\\${formData.status === 'draft' ? 'bg-amber-500/10 border-amber-500 text-amber-600' : 'bg-[var(--admin-bg)] border-[var(--admin-border)] text-[var(--admin-text-muted)] hover:border-primary/20'}\`}
                  >
                    <div className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center \\\${formData.status === 'draft' ? 'border-amber-500' : 'border-[var(--admin-border)]'}\`}>
                      {formData.status === 'draft' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                    </div>
                    Draft
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--admin-border)]">
                <Button onClick={handleSave} className="w-full h-14 bg-primary hover:bg-primary-hover text-white rounded-app font-black uppercase tracking-[0.2em] text-xs active:scale-95 transition-all">
                  Update Synchronicity
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
`;

  // Replace everything from secondReturnIdx to lastClosingBraceIdx
  lines.splice(secondReturnIdx, lastClosingBraceIdx - secondReturnIdx, newReturnBlock);
  
  fs.writeFileSync(path, lines.join('\\r\\n'), 'utf8');
  console.log('Successfully rebuilt the second return block with correct nesting and removed Info Block!');
} else {
  console.log('Could not find second return!');
}
