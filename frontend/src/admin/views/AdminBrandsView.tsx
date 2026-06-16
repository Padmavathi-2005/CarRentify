"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Search, 
 Plus, 
 Filter, 
 Edit, 
 Trash2, 
 ShieldCheck, 
 ArrowUpDown,
 Globe,
 Image as ImageIcon,
 CheckCircle,
 Clock,
 RefreshCw,
 X,
 Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/components/ThemeProvider";
import { API_BASE_URL } from "@/config/api";
import Modal from "@/components/ui/modal";

export default function AdminBrandsView() {
 const [brands, setBrands] = useState<any[]>([]);
 const [search, setSearch] = useState("");
 const [loading, setLoading] = useState(true);
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(10);
 const { settings } = useSettings();
 const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
 const [sortOrder, setSortOrder] = useState<"newest" | "name_asc" | "name_desc">("newest");

 React.useEffect(() => {
  if (settings?.itemsPerPageLimit) setItemsPerPage(settings.itemsPerPageLimit);
 }, [settings?.itemsPerPageLimit]);

 // Modal States
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingBrand, setEditingBrand] = useState<any>(null);
   const [saving, setSaving] = useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const minW = 100;
        const minH = 50;
        const targetW = 400;
        const targetH = 200;

        if (img.width < minW || img.height < minH) {
          alert(`Quality Shield: Manufacturer logos require at least ${minW}x${minH}px for high-definition display. Your image is ${img.width}x${img.height}px.`);
          setSaving(false);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          const scale = Math.min(targetW / img.width, targetH / img.height);
          const x = (targetW / 2) - (img.width / 2) * scale;
          const y = (targetH / 2) - (img.height / 2) * scale;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          setFormData(prev => ({ ...prev, logo: canvas.toDataURL('image/png', 0.9) }));
        }
        setSaving(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
 const [formData, setFormData] = useState({
  name: "",
  logo: "",
  isActive: true
 });

 useEffect(() => {
  fetchBrands();
 }, []);

 const fetchBrands = async () => {
  try {
   setLoading(true);
   const response = await fetch(`${API_BASE_URL}/brands?all=true`);
   const data = await response.json();
   setBrands(data);
  } catch (error) {
   console.error("Error fetching brands:", error);
  } finally {
   setLoading(false);
  }
 };

 const handleOpenModal = (brand: any = null) => {
  if (brand) {
   setEditingBrand(brand);
   setFormData({
    name: brand.name,
    logo: brand.logo || "",
    isActive: brand.isActive !== undefined ? brand.isActive : true
   });
  } else {
   setEditingBrand(null);
   setFormData({
    name: "",
    logo: "",
    isActive: true
   });
  }
  setIsModalOpen(true);
 };

 const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.name) return alert("Brand name is required.");
  
  setSaving(true);
  try {
   const url = editingBrand 
    ? `${API_BASE_URL}/brands/${editingBrand._id}` 
    : `${API_BASE_URL}/brands`;
   const method = editingBrand ? "PATCH" : "POST";

   const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
   });

   if (response.ok) {
    setIsModalOpen(false);
    fetchBrands();
   } else {
    const error = await response.json();
    alert(`Error: ${error.message || "Failed to save brand"}`);
   }
  } catch (error) {
   console.error("Error saving brand:", error);
   alert("Network error. Please try again.");
  } finally {
   setSaving(false);
  }
 };

 const handleDelete = async (id: string) => {
  if (window.confirm("Are you sure you want to delete this brand? This action cannot be undone.")) {
  try {
  const response = await fetch(`${API_BASE_URL}/brands/${id}`, {
  method: "DELETE",
  });
  if (response.ok) {
  setBrands(brands.filter(b => b._id !== id));
  } else {
  alert("Failed to delete brand. Please try again.");
  }
  } catch (error) {
  console.error("Error deleting brand:", error);
  alert("An error occurred while deleting the brand.");
  }
  }
 };

 const filteredBrands = brands
  .filter(brand => {
   const matchesSearch = brand.name?.toLowerCase().includes(search.toLowerCase());
   const matchesStatus = statusFilter === "all" ? true : 
                         statusFilter === "active" ? brand.isActive !== false : 
                         brand.isActive === false;
   return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
   if (sortOrder === "name_asc") return (a.name || "").localeCompare(b.name || "");
   if (sortOrder === "name_desc") return (b.name || "").localeCompare(a.name || "");
   return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

 // Pagination Logic
 const totalItems = filteredBrands.length;
 const totalPages = Math.ceil(totalItems / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedBrands = filteredBrands.slice(startIndex, startIndex + itemsPerPage);

 const getPaginationRange = () => {
 const totalNumbers = 5;
 if (totalPages <= totalNumbers) {
 return Array.from({ length: totalPages }, (_, i) => i + 1);
 }

 const range: (number | string)[] = [];
 if (currentPage <= 3) {
 range.push(1, 2, 3, "...", totalPages);
 } else if (currentPage >= totalPages - 2) {
 range.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
 } else {
 range.push(1, "...", currentPage, "...", totalPages);
 }
 return range;
 };

 return (
  <div className="space-y-6">
  {/* Header Tier */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] ">
  <div>
  <h1 className="text-2xl font-black tracking-tight text-[var(--admin-text-main)] mb-1 flex items-center gap-3">
  <div className="p-2 bg-primary/10 rounded-app text-primary"><ShieldCheck size={20} /></div>
  Brand Governance
  </h1>
  <p className="text-[var(--admin-text-muted)] font-bold text-[9px] uppercase tracking-[0.2em]">Scale and verify your automotive manufacturer ecosystem</p>
  </div>
  <Button 
    onClick={() => handleOpenModal()}
    className="h-10 px-6 rounded-app bg-[var(--primary-brand-color)] text-white font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all border-none"
  >
  <Plus size={14} className="mr-2" /> Add Brand
  </Button>
  </div>

  {/* Control Layer */}
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <div className="md:col-span-2 relative group text-xs">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--admin-text-muted)] group-focus-within:text-primary transition-colors" />
  <Input 
  placeholder="Search partners by name..." 
  className="w-full pl-12 h-11 bg-[var(--admin-card-bg)] border-[var(--admin-border)] rounded-app focus-visible:ring-primary/20 text-xs font-bold text-[var(--admin-text-main)]"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  />
  </div>
  <div className="md:col-span-2 flex gap-3">
  <Button 
    variant="outline" 
    onClick={() => { setStatusFilter(p => p === "all" ? "active" : p === "active" ? "inactive" : "all"); setCurrentPage(1); }}
    className="h-11 flex-1 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] transition-all"
  >
  <Filter size={14} className="mr-2" /> 
  {statusFilter === "all" ? "All Partners" : statusFilter === "active" ? "Active Partners" : "Inactive Partners"}
  </Button>
  <Button 
    variant="outline" 
    onClick={() => setSortOrder(p => p === "newest" ? "name_asc" : p === "name_asc" ? "name_desc" : "newest")}
    className="h-11 w-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[var(--admin-text-muted)] hover:text-primary transition-all"
    title={sortOrder === "newest" ? "Sort by Newest" : sortOrder === "name_asc" ? "Sort A-Z" : "Sort Z-A"}
  >
  <ArrowUpDown size={16} />
  </Button>
  </div>
  </div>

  {/* Golden Template Table View */}
  <div className="bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] overflow-hidden">
  <div className="overflow-x-auto">
  <table className="w-full text-left border-collapse">
  <thead>
  <tr className="bg-[var(--admin-bg)]/50 border-b border-[var(--admin-border)]">
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Brand</th>
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Origin</th>
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Status</th>
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)]">Joined</th>
  <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--admin-text-muted)] text-right">Actions</th>
  </tr>
  </thead>
  <tbody className="divide-y divide-[var(--admin-border)] text-[11px] font-bold text-[var(--admin-text-muted)]">
  <AnimatePresence mode="popLayout">
  {loading ? (
  <tr>
  <td colSpan={5} className="p-20 text-center">
  <div className="flex flex-col items-center gap-3">
  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">Syncing ecosystem...</p>
  </div>
  </td>
  </tr>
  ) : paginatedBrands.length === 0 ? (
  <tr>
  <td colSpan={5} className="p-20 text-center">
  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] opacity-30">No brand matches found</p>
  </td>
  </tr>
  ) : (
  paginatedBrands.map((brand) => (
  <motion.tr 
  key={brand._id}
  layout
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  className="hover:bg-[var(--admin-bg)]/50 transition-all group"
  >
  <td className="p-5">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 rounded-app bg-[var(--admin-bg)] flex items-center justify-center overflow-hidden border border-[var(--admin-border)] group-hover:scale-110 transition-transform">
  {brand.logo ? (
  <img src={brand.logo} className="w-8 h-8 object-contain" alt={brand.name} />
  ) : (
  <ImageIcon size={18} className="text-[var(--admin-text-muted)] opacity-30" />
  )}
  </div>
  <div>
  <p className="font-black text-[var(--admin-text-main)] text-xs tracking-tight">{brand.name}</p>
  <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest mt-0.5">Tier 1 Partner</p>
  </div>
  </div>
  </td>
  <td className="p-5">
  <div className="flex items-center gap-1.5 font-black uppercase tracking-widest text-[9px] text-[var(--admin-text-muted)]">
  <Globe size={12} className="text-primary" /> Global
  </div>
  </td>
  <td className="p-5">
  <div className="flex items-center gap-2">
  <div className={`w-1.5 h-1.5 rounded-full ${brand.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'} `} />
  <span className={`text-[9px] font-black uppercase tracking-widest ${brand.isActive !== false ? 'text-emerald-600' : 'text-rose-600'}`}>
    {brand.isActive !== false ? 'Verified' : 'Inactive'}
  </span>
  </div>
  </td>
  <td className="p-5">
  <div className="flex items-center gap-2 font-black text-[var(--admin-text-muted)] text-[10px] uppercase">
  <Clock size={12} /> {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
  </div>
  </td>
  <td className="p-5 text-right">
  <div className="flex items-center justify-end gap-2">
  <Button 
  size="icon" 
  variant="ghost" 
  onClick={() => handleOpenModal(brand)}
  className="w-9 h-9 rounded-app bg-[var(--admin-bg)] text-[var(--admin-text-main)] hover:bg-[var(--primary-brand-color)] hover:text-white transition-all "
  >
  <Edit size={14} />
  </Button>
  <Button 
  size="icon" 
  variant="ghost" 
  onClick={() => handleDelete(brand._id)}
  className="w-9 h-9 rounded-app bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all "
  >
  <Trash2 size={14} />
  </Button>
  </div>
  </td>
  </motion.tr>
  ))
  )}
  </AnimatePresence>
  </tbody>
  </table>
  </div>

  {/* Dynamic Pagination Control */}
  <div className="bg-[var(--admin-bg)]/50 border-t border-[var(--admin-border)] p-4 flex flex-col md:flex-row justify-between items-center gap-4">
  <div className="flex items-center gap-4">
  <div className="flex items-center gap-2">
  <span className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Show</span>
  <select 
  className="h-8 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-2 text-[10px] font-black text-[var(--admin-text-main)] outline-none focus:ring-2 focus:ring-primary/20 transition-all "
  value={itemsPerPage}
  onChange={(e) => {
  setItemsPerPage(Number(e.target.value));
  setCurrentPage(1);
  }}
  >
  {[...new Set([5, 10, 20, 50, settings?.itemsPerPageLimit || 10])].sort((a,b)=>a-b).map(opt => (
    <option key={opt} value={opt}>{opt}</option>
  ))}
  </select>
  </div>
  <p className="text-[9px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">
  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} brands
  </p>
  </div>

  <div className="flex items-center gap-1.5">
  <Button 
  variant="outline" 
  size="sm" 
  className="h-8 px-3 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] disabled:opacity-30 transition-all hover:bg-[var(--admin-bg)]"
  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
  disabled={currentPage === 1}
  >
  Prev
  </Button>
  
  <div className="flex items-center gap-1 mx-2">
  {getPaginationRange().map((page, idx) => (
  page === "..." ? (
  <div key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-[var(--admin-text-muted)] font-bold text-[10px] opacity-30">...</div>
  ) : (
  <button
  key={`page-${page}`}
  onClick={() => setCurrentPage(Number(page))}
  className={`w-8 h-8 rounded-app text-[10px] font-black transition-all ${
  currentPage === page 
  ? 'bg-[var(--primary-brand-color)] text-white ' 
  : 'bg-[var(--admin-card-bg)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] border border-[var(--admin-border)]'
  }`}
  >
  {page}
  </button>
  )
  ))}
  </div>

  <Button 
  variant="outline" 
  size="sm" 
  className="h-8 px-3 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] disabled:opacity-30 transition-all hover:bg-[var(--admin-bg)]"
  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
  disabled={currentPage === totalPages}
  >
  Next
  </Button>
  </div>
  </div>
  </div>

  {/* Brand Creation/Edit Modal */}
  <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title={editingBrand ? "Modify Brand Identity" : "Register New Brand"}
    description="Manage manufacturer assets and ecosystem status."
    icon={<ShieldCheck size={24} />}
  >
    <form onSubmit={handleSave} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Brand Name</label>
          <Input 
            placeholder="e.g. Mercedes-Benz"
            className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] focus:bg-[var(--admin-card-bg)] transition-all font-bold px-4 text-xs text-[var(--admin-text-main)]"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Brand Logo</label>
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 rounded-app bg-[var(--admin-bg)] flex items-center justify-center border border-[var(--admin-border)] shrink-0 overflow-hidden relative group/logo cursor-pointer hover:border-primary/50 transition-all" onClick={() => logoInputRef.current?.click()}>
              {formData.logo ? (
                <img src={formData.logo} className="w-14 h-14 object-contain" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-[var(--admin-text-muted)]">
                  <ImageIcon size={24} className="opacity-20" />
                  <span className="text-[8px] font-black uppercase">Upload</span>
                </div>
              )}
              {saving && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <RefreshCw size={16} className="animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-3">
              <Input 
                placeholder="Or paste external URL..."
                className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] focus:bg-[var(--admin-card-bg)] transition-all font-bold px-4 text-xs text-[var(--admin-text-main)]"
                value={formData.logo}
                onChange={(e) => setFormData({...formData, logo: e.target.value})}
              />
              <p className="text-[8px] text-[var(--admin-text-muted)] font-bold uppercase tracking-widest px-1">Recommended: 400x200px (PNG) with transparent background</p>
            </div>
            <input 
              type="file" 
              className="hidden" 
              ref={logoInputRef} 
              accept="image/*"
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 bg-[var(--admin-bg)]/50 p-4 rounded-app border border-[var(--admin-border)]">
          <input 
            type="checkbox"
            id="brandStatus"
            checked={formData.isActive}
            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            className="w-4 h-4 rounded border-[var(--admin-border)] text-primary focus:ring-primary"
          />
          <label htmlFor="brandStatus" className="text-[10px] font-black text-[var(--admin-text-main)] uppercase tracking-widest cursor-pointer">
            Mark as Active & Verified Partner
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          type="button"
          variant="outline"
          onClick={() => setIsModalOpen(false)}
          className="flex-1 h-11 rounded-app border-[var(--admin-border)] text-[10px] font-black uppercase tracking-widest"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={saving}
          className="flex-1 h-11 rounded-app bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Processing...
            </div>
          ) : (
            editingBrand ? "Update Identity" : "Confirm Registry"
          )}
        </Button>
      </div>
    </form>
  </Modal>
  </div>
 );
}
