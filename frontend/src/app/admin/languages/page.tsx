"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  LanguagesIcon,
  Flag,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminTranslationContext } from "../AdminTranslationContext";
import { API_BASE_URL } from "@/config/api";

export default function AdminLanguages() {
  const { t } = React.useContext(AdminTranslationContext);
  const [languages, setLanguages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", nativeName: "", code: "" });

  const fetchLanguages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/languages`);
      if (res.ok) setLanguages(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLanguages(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/languages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", nativeName: "", code: "" });
        window.dispatchEvent(new CustomEvent('languagesUpdated'));
        fetchLanguages();
      }
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.languages.deleteConfirm || "Delete language?")) return;
    try {
      await fetch(`${API_BASE_URL}/languages/${id}`, { method: 'DELETE' });
      window.dispatchEvent(new CustomEvent('languagesUpdated'));
      fetchLanguages();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl relative">
      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
          <div className="fixed inset-0 bg-black/60" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-10 animate-fade-in border border-slate-100">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all"><X size={20} /></button>
             <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-900 tracking-tight">Add New Language</h2>
             <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">{t.languages.fields.name}</label>
                   <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. English" className="h-12 rounded-xl bg-slate-50 border-none font-bold px-6 focus-visible:ring-primary/10" required />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">{t.languages.fields.native}</label>
                   <Input value={formData.nativeName} onChange={e => setFormData({...formData, nativeName: e.target.value})} placeholder="e.g. English, Français" className="h-12 rounded-xl bg-slate-50 border-none font-bold px-6 focus-visible:ring-primary/10" required />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">{t.languages.fields.code}</label>
                   <Input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="en" className="h-12 rounded-xl bg-slate-50 border-none font-bold px-6 focus-visible:ring-primary/10" required />
                </div>
                <Button type="submit" className="w-full h-14 bg-primary text-white font-black rounded-2xl mt-6 shadow-xl shadow-primary/20 hover:bg-black transition-all">{t.languages.save}</Button>
             </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm font-sans">
        <div>
           <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Globe className="text-primary" size={24} /> {t.languages.title}
           </h1>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.languages.desc}</p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-black text-white h-11 px-6 rounded-xl font-bold gap-2">
            <Plus size={18} /> {t.languages.add}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden font-sans">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.languages.table.hub}</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t.languages.table.code}</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t.languages.table.status}</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">{t.header.active || "Actions"}</th>
               </tr>
            </thead>
            <tbody>
               {loading ? (
                 <tr><td colSpan={4} className="p-12 text-center text-xs font-bold text-slate-300">Synchronizing...</td></tr>
               ) : languages.length === 0 ? (
                 <tr><td colSpan={4} className="p-12 text-center text-xs font-bold text-slate-300">No languages configured.</td></tr>
               ) : languages.map((lang) => (
                  <tr key={lang._id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-all group">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                              <LanguagesIcon size={14} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 leading-tight">{lang.name}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{lang.nativeName}</span>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-2.5 py-1.5 rounded-md bg-slate-50">{lang.code}</span>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 flex items-center gap-1 w-fit mx-auto border border-emerald-100">
                           <CheckCircle2 size={10} /> {t.header.active || "Active"}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button onClick={() => handleDelete(lang._id)} size="icon" variant="ghost" className="w-8 h-8 rounded-lg text-slate-300 hover:text-rose-500 transition-colors">
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
