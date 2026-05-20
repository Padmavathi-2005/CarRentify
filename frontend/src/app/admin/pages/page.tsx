"use client";

import React, { useState, useEffect } from "react";
import { 
 FileText, 
 Plus, 
 Search, 
 Filter, 
 MoreVertical, 
 Edit3, 
 Trash2, 
 Eye,
 Globe,
 Clock,
 CheckCircle2,
 AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AdminTranslationContext, useAdminTranslation } from "../AdminTranslationContext";
import { API_BASE_URL } from "@/config/api";

export default function AdminStaticPages() {
 const { t } = useAdminTranslation();
 const [pages, setPages] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchPages = async () => {
 try {
 const res = await fetch(`${API_BASE_URL}/pages`);
 if (res.ok) {
 const data = await res.json();
 setPages(data);
 }
 } catch (err) {
 console.error("Failed to fetch pages:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchPages();
 }, []);

 const handleDelete = async (id: string) => {
 if (!confirm(t.languages.deleteConfirm || "Are you sure?")) return;
 try {
 const res = await fetch(`${API_BASE_URL}/pages/${id}`, { method: 'DELETE' });
 if (res.ok) {
 setPages(prev => prev.filter(p => p._id !== id));
 }
 } catch (err) {
 console.error("Delete failed:", err);
 }
 };

 return (
 <div className="space-y-6 animate-fade-in">
 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[var(--admin-card-bg)] p-6 rounded-app border border-[var(--admin-border)] dark:">
 <div>
 <h1 className="text-xl font-black text-[var(--admin-text-main)] tracking-tight flex items-center gap-3">
 <FileText className="text-primary" size={24} /> {t.staticPages.title}
 </h1>
 <p className="text-[var(--admin-text-muted)] font-bold tracking-wide mt-1 uppercase text-[10px]">{t.staticPages.desc || "Manage static content."}</p>
 </div>
 
 <Link href="/admin/pages/new">
 <Button className="bg-primary hover:bg-primary-hover text-white h-14 px-8 rounded-app font-black gap-3 border-none transition-all scale-100 hover:scale-105 active:scale-95">
 <Plus size={22} /> {t.staticPages.addPage}
 </Button>
 </Link>
 </div>

 {/* Filters */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center bg-[var(--admin-card-bg)] p-4 rounded-app border border-[var(--admin-border)] dark:">
 <div className="relative lg:col-span-2">
 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={18} />
 <Input 
 placeholder="Search by title or slug..." 
 className="w-full pl-14 h-12 bg-[var(--admin-bg)] border-none rounded-app focus-visible:ring-primary/10 font-bold text-sm text-[var(--admin-text-main)]"
 />
 </div>
 <Button variant="outline" className="h-12 rounded-app border-[var(--admin-border)] text-[var(--admin-text-muted)] font-bold gap-2 hover:bg-[var(--admin-bg)] hover:text-primary transition-all">
 <Filter size={18} /> Status: All
 </Button>
 <div className="text-right px-4">
 <span className="text-[10px] font-black text-[var(--admin-text-muted)]/50 uppercase tracking-[0.2em]">Total {pages.length} Pages</span>
 </div>
 </div>

 {/* Table Section - Optimized for Response */}
 <div className="bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] dark: overflow-hidden overflow-x-auto no-scrollbar">
 <table className="w-full text-left">
 <thead>
 <tr className="bg-[var(--admin-bg)]/50 border-b border-[var(--admin-border)]">
 <th className="px-8 py-6 text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Page Title & Slug</th>
 <th className="px-8 py-6 text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Visibility</th>
 <th className="px-8 py-6 text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Created At</th>
 <th className="px-8 py-6 text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr>
 <td colSpan={4} className="px-8 py-20 text-center font-bold text-slate-400 animate-pulse">Synchronizing with Database...</td>
 </tr>
 ) : pages.length === 0 ? (
 <tr>
 <td colSpan={4} className="px-8 py-20 text-center font-bold text-slate-400">No static pages found. Create your first document!</td>
 </tr>
 ) : pages.map((page) => (
 <tr key={page._id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)]/50 transition-colors group">
 <td className="px-8 py-6">
 <div className="flex flex-col">
 <span className="text-sm font-black text-[var(--admin-text-main)] group-hover:text-primary transition-colors cursor-pointer">{page.title}</span>
 <span className="text-[10px] font-bold text-[var(--admin-text-muted)] flex items-center gap-1 mt-1">
 <Globe size={10} /> /{page.slug}
 </span>
 </div>
 </td>
 <td className="px-8 py-6">
 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
 page.status === 'Published' 
 ? 'bg-emerald-50 text-emerald-600' 
 : 'bg-amber-50 text-amber-600'
 }`}>
 {page.status === 'Published' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
 {page.status}
 </span>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center gap-2 text-[var(--admin-text-muted)] font-bold text-xs">
 <Clock size={14} className="text-[var(--admin-text-muted)]/30" /> {new Date(page.createdAt).toLocaleDateString()}
 </div>
 </td>
 <td className="px-8 py-6">
 <div className="flex items-center justify-end gap-3">
 <Link href={`/admin/pages/${page._id}`}>
 <Button size="icon" variant="ghost" className="w-10 h-10 border border-[var(--admin-border)] rounded-app text-[var(--admin-text-muted)] hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all" title="Edit Page">
 <Edit3 size={18} />
 </Button>
 </Link>
 <Button 
 onClick={() => handleDelete(page._id)}
 size="icon" variant="ghost" className="w-10 h-10 border border-[var(--admin-border)] rounded-app text-[var(--admin-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all" title="Delete Page">
 <Trash2 size={18} />
 </Button>
 <Link href={`/pages/${page.slug}`} target="_blank">
 <Button size="icon" variant="ghost" className="w-10 h-10 border border-[var(--admin-border)] rounded-app text-[var(--admin-text-muted)] hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all" title="View Public">
 <Eye size={18} />
 </Button>
 </Link>
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
