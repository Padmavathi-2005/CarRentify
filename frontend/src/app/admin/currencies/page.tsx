"use client";

import React, { useState, useEffect } from "react";
import { 
  Wallet, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  DollarSign,
  Coins,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminTranslationContext } from "../AdminTranslationContext";
import { API_BASE_URL } from "@/config/api";

export default function AdminCurrencies() {
  const { t } = React.useContext(AdminTranslationContext);
  const [currencies, setCurrencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", code: "", symbol: "" });

  const fetchCurrencies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/currencies`);
      if (res.ok) setCurrencies(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCurrencies(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/currencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", code: "", symbol: "" });
        fetchCurrencies();
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.languages.deleteConfirm || "Delete currency?")) return;
    try {
      await fetch(`${API_BASE_URL}/currencies/${id}`, { method: 'DELETE' });
      fetchCurrencies();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl relative">
      {/* Custom Modal - REPLACING SHADCN DIALOG TO AVOID MISSING COMPONENT ERROR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-10 animate-fade-in border border-slate-100">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"><X size={20} /></button>
             <h2 className="text-xl font-black mb-6 flex items-center gap-2">Add New Currency</h2>
             <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Name</label>
                   <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. US Dollar" className="h-12 rounded-xl bg-slate-50 border-none font-bold px-6" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">ISO Code</label>
                      <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="USD" className="h-12 rounded-xl bg-slate-50 border-none font-bold px-6" required />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Symbol</label>
                      <Input value={formData.symbol} onChange={e => setFormData({...formData, symbol: e.target.value})} placeholder="$" className="h-12 rounded-xl bg-slate-50 border-none font-bold px-6" required />
                   </div>
                </div>
                <Button type="submit" className="w-full h-14 bg-primary text-white font-black rounded-2xl mt-6 shadow-xl shadow-primary/20 hover:bg-black transition-all">Save Currency</Button>
             </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
           <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Wallet className="text-primary" size={24} /> {t.currencies.title}
           </h1>
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.currencies.desc}</p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-black text-white h-11 px-6 rounded-xl font-bold gap-2">
            <Plus size={18} /> {t.currencies.add}
        </Button>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.currencies.table.unit}</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t.currencies.table.code}</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t.currencies.table.symbol}</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">{t.header.active || "Actions"}</th>
               </tr>
            </thead>
            <tbody>
               {loading ? (
                 <tr><td colSpan={4} className="p-12 text-center text-xs font-bold text-slate-300">Synchronizing...</td></tr>
               ) : currencies.map((curr) => (
                  <tr key={curr._id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-all group">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                              <Coins size={14} />
                           </div>
                           <span className="text-xs font-bold text-slate-900">{curr.name}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-1 rounded-md">{curr.code}</span>
                     </td>
                     <td className="px-6 py-4 text-center font-black text-slate-900 text-sm">
                        {curr.symbol}
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button onClick={() => handleDelete(curr._id)} size="icon" variant="ghost" className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 size={16} />
                           </Button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
}
