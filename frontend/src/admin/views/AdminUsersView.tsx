"use client";

import React, { useState, useContext } from "react";
import { 
 Search, 
 Edit, 
 Trash2, 
 User, 
 Users,
 ShieldCheck, 
 Mail, 
 Calendar,
 UserPlus,
 Image as ImageIcon,
 MapPin,
 Wallet,
 ArrowUpCircle,
 ArrowDownCircle,
 Eye,
 CheckCircle2,
 XCircle,
 Loader2,
 MessageSquare,
 FileText,
 ArrowRight,
 X
} from "lucide-react";
import { AdminTranslationContext, useAdminTranslation } from "@/app/admin/AdminTranslationContext";
import { API_BASE_URL, BACKEND_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { walletService } from "@/services/walletService";
import { authService } from "@/services/authService";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import "../styles/AdminDashboardView.css";

// Mock Data for User Governance
const INITIAL_USERS = [
 { id: 1, name: "Alena Thiel", email: "alena@rentify.io", role: "Admin", status: "Active", joined: "2024-03-15" },
 { id: 2, name: "Marcus Webber", email: "marcus@fleet.pro", role: "Vendor", status: "Active", joined: "2024-04-02" },
 { id: 3, name: "Sarah Jenkins", email: "sarah.j@gmail.com", role: "Customer", status: "Active", joined: "2024-04-10" },
 { id: 4, name: "David Chen", email: "d.chen@enterprise.co", role: "Vendor", status: "Inactive", joined: "2024-01-20" },
 { id: 5, name: "Jessica Bloom", email: "jess@rentify.io", role: "Admin", status: "Active", joined: "2024-02-28" },
];

export default function AdminUsersView() {
 const { t } = useAdminTranslation();
 const searchParams = useSearchParams();
 const [users, setUsers] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
 const [currentPage, setCurrentPage] = useState(1);
 const [itemsPerPage, setItemsPerPage] = useState(10);
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [currentUser, setCurrentUser] = useState<any>(null);

 // New User State
 const [newUser, setNewUser] = useState({ 
 firstName: "", lastName: "", displayName: "", email: "", role: "user", status: "Active", password: "password123", 
 phone: "", doorNo: "", street: "", city: "", state: "", postalCode: "", address: "", lat: 0, lon: 0, profileImage: "" 
 });

 // Wallet Management State
 const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
 const [walletAmount, setWalletAmount] = useState("");
 const [walletDescription, setWalletDescription] = useState("");
 const [walletType, setWalletType] = useState<'credit' | 'debit'>('credit');
 const [walletLoading, setWalletLoading] = useState(false);

 // Verification Review State
 const [isVerifOpen, setIsVerifOpen] = useState(false);
 const [selectedVerif, setSelectedVerif] = useState<any>(null);
 const [verifLoading, setVerifLoading] = useState(false);
 const [processingVerif, setProcessingVerif] = useState(false);
 const [adminNote, setAdminNote] = useState("");
 const [fullImageUrl, setFullImageUrl] = useState<string | null>(null);

 const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
 const [isSearchingAddress, setIsSearchingAddress] = useState(false);
 const [roleFilter, setRoleFilter] = useState("all");
 const [statusFilter, setStatusFilter] = useState("all");
 const [verifFilter, setVerifFilter] = useState("all");

 const fetchAddressSuggestions = async (query: string) => {
 if (query.length < 3) {
 setAddressSuggestions([]);
 return;
 }
 setIsSearchingAddress(true);
 try {
 const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=5`);
 if (res.ok) {
 const data = await res.json();
 setAddressSuggestions(data);
 }
 } catch (err) {
 console.error("OSM Fetch error:", err);
 } finally {
 setIsSearchingAddress(false);
 }
 };

 const fetchUsers = async () => {
 try {
 setLoading(true);
 const [usersRes, verifRes] = await Promise.all([
 fetch(`${API_BASE_URL}/users`, {
 headers: { Authorization: `Bearer ${authService.getAdminToken()}` }
 }),
 fetch(`${API_BASE_URL}/verification`, {
 headers: { Authorization: `Bearer ${authService.getAdminToken()}` }
 })
 ]);

 if (!usersRes.ok) console.error("Users fetch failed:", usersRes.status);
 if (!verifRes.ok) console.error("Verif fetch failed:", verifRes.status);

 const usersData = usersRes.ok ? await usersRes.json() : [];
 const verifData = verifRes.ok ? await verifRes.json() : [];

 console.log(`Mapping ${usersData.length} users with ${verifData.length} verifications`);
 const mappedUsers = usersData.map((u: any) => {
 const uId = (u._id || u.id)?.toString();
 const uEmail = u.email?.toLowerCase();
 
 const verif = verifData?.find ? verifData.find((v: any) => {
 const vUserIdRaw = v.userId?._id || v.userId;
 const vUserId = vUserIdRaw?.toString();
 const vEmail = v.userId?.email?.toLowerCase();
 
 // Match by ID or Email (if populated)
 return (vUserId === uId) || (uEmail && vEmail && uEmail === vEmail);
 }) : null;

 return {
 ...u,
 verificationStatus: verif?.status || u.verificationStatus || 'not_submitted',
 hasVerificationDoc: !!verif,
 docCount: verif?.documents?.length || 0
 };
 });
 setUsers(mappedUsers);
 if (usersRes.status === 401 || verifRes.status === 401 || usersRes.status === 403 || verifRes.status === 403) {
 console.warn("Security session mismatch detected. Forcing re-authentication.");
 authService.adminLogout();
 return;
 }
 } catch (err) {
 console.error("Failed to fetch principals:", err);
 } finally {
 setLoading(false);
 }
 };

 const handleReviewVerification = async (userId: string) => {
 try {
 setVerifLoading(true);
 setIsVerifOpen(true);
 const res = await fetch(`${API_BASE_URL}/verification/my-status`, {
 headers: { Authorization: `Bearer ${authService.getAdminToken()}` },
 // Normally we'd want an admin-specific fetch-by-userid endpoint
 // But let's assume we use /verification which gives all and find the one for this user
 });
 
 // Better: Fetch all verifications and find the one for this user
 const allRes = await fetch(`${API_BASE_URL}/verification`, {
 headers: { Authorization: `Bearer ${authService.getAdminToken()}` },
 });
 if (allRes.ok) {
 const all = await allRes.json();
 const found = all.find((v: any) => (v.userId?._id || v.userId) === userId);
 if (found) {
 setSelectedVerif(found);
 setAdminNote(found.adminNote || "");
 } else {
 alert("Verification documents not found for this user.");
 setIsVerifOpen(false);
 }
 }
 if (allRes.status === 401 || allRes.status === 403) {
 console.warn("Security session mismatch detected. Forcing re-authentication.");
 authService.adminLogout();
 return;
 }
 } catch (err) {
 console.error(err);
 } finally {
 setVerifLoading(false);
 }
 };

 const handleApproveVerif = async () => {
 if (!selectedVerif) return;
 setProcessingVerif(true);
 try {
 const res = await fetch(`${API_BASE_URL}/verification/${selectedVerif._id}/approve`, {
 method: "PATCH",
 headers: { 
 "Content-Type": "application/json",
 Authorization: `Bearer ${authService.getAdminToken()}` 
 },
 body: JSON.stringify({ adminNote }),
 });
 if (res.ok) {
 setIsVerifOpen(false);
 fetchUsers();
 }
 } catch (err) {
 console.error(err);
 } finally {
 setProcessingVerif(false);
 }
 };

 const handleRejectVerif = async () => {
 if (!selectedVerif || !adminNote) {
 alert("Please provide a reason for rejection.");
 return;
 }
 setProcessingVerif(true);
 try {
 const res = await fetch(`${API_BASE_URL}/verification/${selectedVerif._id}/reject`, {
 method: "PATCH",
 headers: { 
 "Content-Type": "application/json",
 Authorization: `Bearer ${authService.getAdminToken()}` 
 },
 body: JSON.stringify({ adminNote }),
 });
 if (res.ok) {
 setIsVerifOpen(false);
 fetchUsers();
 }
 } catch (err) {
 console.error(err);
 } finally {
 setProcessingVerif(false);
 }
 };

 React.useEffect(() => {
 fetchUsers();
 }, []);

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

 const filteredUsers = users.filter((u: any) => {
 // Definitive exclusion of admin types as requested
 if (u.role?.toLowerCase() === 'admin') return false;

 // Filter by Role
 if (roleFilter !== 'all' && u.role?.toLowerCase() !== roleFilter.toLowerCase()) return false;
 
  // Filter by Status
  const uStatus = (u.status || "Active").toLowerCase();
  if (statusFilter !== 'all' && uStatus !== statusFilter.toLowerCase()) return false;

 // Filter by Verification
 if (verifFilter !== 'all') {
 if (verifFilter === 'verified' && (u.verificationStatus !== 'approved' && !u.isVerified)) return false;
 if (verifFilter === 'unverified' && (u.verificationStatus === 'approved' || u.isVerified)) return false;
 if (verifFilter === 'pending' && u.verificationStatus !== 'pending') return false;
 }

 const query = searchQuery.toLowerCase();
 return (
 (u.firstName?.toLowerCase() || "").includes(query) || 
 (u.lastName?.toLowerCase() || "").includes(query) || 
 (u.displayName?.toLowerCase() || "").includes(query) || 
 (u.email?.toLowerCase() || "").includes(query) ||
 (u.phone?.toLowerCase() || "").includes(query) ||
 (u.address?.toLowerCase() || "").includes(query) ||
    (u.city?.toLowerCase() || "").includes(query) ||
    (u.status?.toLowerCase() || "active").includes(query)
  );
 });

 // Pagination Logic
 const totalItems = filteredUsers.length;
 const totalPages = Math.ceil(totalItems / itemsPerPage);
 const startIndex = (currentPage - 1) * itemsPerPage;
 const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

 const handleAddUser = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 const res = await fetch(`${API_BASE_URL}/users`, {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(newUser)
 });
 if (res.ok) {
 setIsAddModalOpen(false);
 setNewUser({ 
 firstName: "", lastName: "", displayName: "", email: "", role: "user", status: "Active", password: "password123", 
 phone: "", doorNo: "", street: "", city: "", state: "", postalCode: "", address: "", lat: 0, lon: 0, profileImage: "" 
 });
 fetchUsers();
 }
 } catch (err) {
 console.error("Onboarding failed:", err);
 }
 };

 const handleEditUser = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 const res = await fetch(`${API_BASE_URL}/users/${currentUser._id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(currentUser)
 });
 if (res.ok) {
 setIsEditModalOpen(false);
 fetchUsers();
 }
 } catch (err) {
 console.error("Update failed:", err);
 }
 };

 const deleteUser = async (id: string) => {
 if (confirm("Are you sure you want to purge this account from the infrastructure?")) {
 try {
 const res = await fetch(`${API_BASE_URL}/users/${id}`, {
 method: 'DELETE'
 });
 if (res.ok) {
 fetchUsers();
 }
 } catch (err) {
 console.error("Purge failed:", err);
 }
 }
 };

 const handleWalletUpdate = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!currentUser || !walletAmount || isNaN(Number(walletAmount))) return;

 try {
 setWalletLoading(true);
 await walletService.adminUpdateBalance(
 currentUser._id || currentUser.id,
 Number(walletAmount),
 walletDescription || `Admin ${walletType} adjustment`,
 walletType
 );
 setIsWalletModalOpen(false);
 setWalletAmount("");
 setWalletDescription("");
 alert("Wallet updated successfully!");
 } catch (err) {
 console.error("Wallet update failed:", err);
 alert("Failed to update wallet");
 } finally {
 setWalletLoading(false);
 }
 };

 const draggable = useDraggableScroll();

 return (
 <div className="space-y-6">
 {/* Page Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 admin-dash-card p-6 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)]">
 <div>
 <h1 className="text-2xl font-black tracking-tight admin-dash-text-main mb-1 flex items-center gap-3">
 <div className="p-2 bg-primary/10 rounded-app text-primary"><Users size={20} /></div>
 {t.users.title}
 </h1>
 <p className="admin-dash-text-muted font-bold text-[9px] uppercase tracking-[0.2em]">{t.users.desc}</p>
 </div>
 <Button 
 onClick={() => setIsAddModalOpen(true)}
 className="h-10 px-6 rounded-app bg-primary text-white font-black hover:bg-primary/90 transition-all uppercase tracking-widest text-[10px] gap-2"
 >
 <UserPlus size={14} /> {t.users.addUser}
 </Button>
 </div>

 {/* Control Bar */}
 <div className="admin-dash-card p-3 rounded-app flex flex-col md:flex-row gap-4 items-center border-[var(--admin-border)] bg-[var(--admin-card-bg)]">
 <div className="relative flex-1 w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 admin-dash-text-muted" size={16} />
 <Input 
 placeholder="Search principals by identity, legal hash or mobile protocol..." 
 className="h-11 pl-11 pr-4 admin-dash-border rounded-app admin-dash-header-bg admin-dash-text-main font-medium focus:bg-primary/5 transition-all focus:ring-4 focus:ring-primary/5 border text-xs"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
 <select 
 value={roleFilter}
 onChange={(e) => setRoleFilter(e.target.value)}
 className="h-11 px-4 rounded-app admin-dash-border admin-dash-card font-black text-[9px] uppercase tracking-widest admin-dash-text-muted outline-none hover:bg-primary/5 transition-all cursor-pointer min-w-[120px]"
 >
 <option value="all">Role: All Types</option>
 <option value="user">Persona: Customer</option>
 </select>

 <select 
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="h-11 px-4 rounded-app admin-dash-border admin-dash-card font-black text-[9px] uppercase tracking-widest admin-dash-text-muted outline-none hover:bg-primary/5 transition-all cursor-pointer min-w-[120px]"
 >
 <option value="all">Status: Global</option>
 <option value="active">Protocol: Active</option>
 <option value="inactive">Protocol: Inactive</option>
 </select>

 <select 
 value={verifFilter}
 onChange={(e) => setVerifFilter(e.target.value)}
 className="h-11 px-4 rounded-app admin-dash-border admin-dash-card font-black text-[9px] uppercase tracking-widest admin-dash-text-muted outline-none hover:bg-primary/5 transition-all cursor-pointer min-w-[120px]"
 >
 <option value="all">Trust: All States</option>
 <option value="verified">Verified Assets</option>
 <option value="pending">Pending Audit</option>
 <option value="unverified">Not Verified</option>
 </select>
 </div>
 </div>

 {/* Users Table */}
 <div className="admin-dash-card rounded-app overflow-hidden border-separate border-[var(--admin-border)] bg-[var(--admin-card-bg)]">
 <div 
 {...draggable}
 className="w-full overflow-x-auto custom-scrollbar"
 >
 <table className="w-full text-left border-collapse relative min-w-[1000px] admin-activity-table">
 <thead>
 <tr className="admin-dash-header-bg border-b admin-dash-border">
 <th className="p-5 text-[9px] font-black admin-dash-text-muted uppercase tracking-[0.2em]">{t.users.table.user || "User"}</th>
 <th className="p-5 text-[9px] font-black admin-dash-text-muted uppercase tracking-[0.2em]">{t.users.table.role || "Role"}</th>
 <th className="p-5 text-[9px] font-black admin-dash-text-muted uppercase tracking-[0.2em]">{t.users.table.contact || "Contact"}</th>
 <th className="p-5 text-[9px] font-black admin-dash-text-muted uppercase tracking-[0.2em]">{t.users.table.location || "Address"}</th>
 <th className="p-5 text-[9px] font-black admin-dash-text-muted uppercase tracking-[0.2em]">Verification</th>
 <th className="p-5 text-[9px] font-black admin-dash-text-muted uppercase tracking-[0.2em]">{t.users.table.status || "Status"}</th>
 <th className="p-5 text-[9px] font-black admin-dash-text-muted uppercase tracking-[0.2em]">{t.users.table.joined || "Joined"}</th>
 <th className="p-5 text-[9px] font-black admin-dash-text-muted uppercase tracking-[0.2em] text-right">{t.users.table.actions || "Actions"}</th>
 </tr>
 </thead>
 <tbody className="divide-y admin-dash-border">
 {paginatedUsers.map((user: any) => (
 <tr key={user._id || user.id} className="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors group">
 <td className="p-5">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-app bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all font-black text-xs uppercase overflow-hidden border border-primary/10">
 {user.profileImage ? (
 <img src={user.profileImage} className="w-full h-full object-cover" alt="" />
 ) : (
 user.displayName?.charAt(0) || user.firstName?.charAt(0) || user.name?.charAt(0) || "U"
 )}
 </div>
 <div>
 <p className="font-black admin-dash-text-main text-xs tracking-tight">
 {user.displayName || (user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : (user.name || "Unknown Identity"))}
 </p>
 <p className="text-[9px] font-bold admin-dash-text-muted uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
 <ShieldCheck size={9} /> {user.firstName || "-"} {user.lastName || ""}
 </p>
 </div>
 </div>
 </td>
 <td className="p-5 text-center md:text-left">
 <span className={`px-3 py-1 rounded-app text-[8px] font-black uppercase tracking-widest border ${
 user.role?.toLowerCase() === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20' :
 'admin-dash-header-bg admin-dash-text-main admin-dash-border'
 }`}>
 {user.role || "User"}
 </span>
 </td>
 <td className="p-5">
 <p className="text-[10px] font-black admin-dash-text-main">{user.phone || "-"}</p>
 <p className="text-[9px] font-medium admin-dash-text-muted flex items-center gap-1 mt-0.5">
 <Mail size={10} className="shrink-0" /> {user.email || "-"}
 </p>
 </td>
 <td className="p-5">
 <p className="text-[10px] font-bold admin-dash-text-muted uppercase tracking-tight truncate max-w-[120px]">
 {user.doorNo ? `${user.doorNo}, ` : ''}
 {user.street ? `${user.street}, ` : ''}
 {user.city || user.address || "-"}
 </p>
 </td>
 <td className="p-5">
 {user.verificationStatus === 'pending' ? (
 <button 
 onClick={() => handleReviewVerification(user._id || user.id)}
 className="flex flex-col gap-1.5 items-start px-3 py-2 rounded-app bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100 dark:bg-orange-500/10 dark:border-orange-500/20 dark:hover:bg-orange-500/20 transition-all group/v "
 >
 <div className="flex items-center gap-2">
 <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
 <span className="text-[8px] font-black uppercase tracking-widest">Pending Review</span>
 </div>
 <div className="flex items-center gap-1.5 text-[9px] font-bold text-orange-500/70">
 <FileText size={10} />
 <span>{user.docCount || 0} Assets Uploaded</span>
 <ArrowRight size={10} className="ml-1 group-hover/v:translate-x-1 transition-transform" />
 </div>
 </button>
 ) : user.verificationStatus === 'approved' || user.isVerified ? (
 <div className="flex flex-col gap-1 items-start px-3 py-2 rounded-app bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 w-fit">
 <div className="flex items-center gap-2">
 <ShieldCheck size={12} />
 <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
 </div>
 <span className="text-[7px] font-bold uppercase opacity-60">Identity Confirmed</span>
 </div>
 ) : user.verificationStatus === 'rejected' ? (
 <div className="flex flex-col gap-1 items-start px-3 py-2 rounded-app bg-rose-500/10 text-rose-600 border border-rose-500/20 w-fit">
 <div className="flex items-center gap-2">
 <XCircle size={12} />
 <span className="text-[8px] font-black uppercase tracking-widest">Rejected</span>
 </div>
 <span className="text-[7px] font-bold uppercase opacity-60">Action Required</span>
 </div>
 ) : (
 <div className="px-3 py-2 rounded-app admin-dash-header-bg admin-dash-border border">
 <span className="text-[8px] font-black admin-dash-text-muted uppercase tracking-widest">Not Submitted</span>
 </div>
 )}
 </td>
 <td className="p-5">
 <div className="flex items-center gap-2">
 <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' || !user.status ? 'bg-emerald-500 ' : 'bg-[var(--admin-text-muted)]'}`} />
 <span className="text-[9px] font-black admin-dash-text-muted uppercase tracking-widest">{user.status || "Active"}</span>
 </div>
 </td>
 <td className="p-5">
 <div className="flex items-center gap-2 admin-dash-text-muted text-[10px] font-black">
 <Calendar size={12} />
 {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
 </div>
 </td>
 <td className="p-5 text-right">
 <div className="flex items-center justify-end gap-2 transition-all opacity-0 group-hover:opacity-100">
 {user.verificationStatus && user.verificationStatus !== 'not_submitted' && (
 <Button 
 size="icon" 
 variant="ghost" 
 className={`w-9 h-9 rounded-app transition-all ${user.verificationStatus === 'pending' ? 'bg-amber-500/10 text-amber-600 animate-pulse border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'}`}
 onClick={() => handleReviewVerification(user._id || user.id)}
 title="Document View"
 >
 <Eye size={14} />
 </Button>
 )}
 <Button 
 size="icon" 
 variant="ghost" 
 className="w-9 h-9 rounded-app transition-all admin-dash-text-muted hover:text-primary hover:bg-primary/10"
 onClick={() => {
 setCurrentUser(user);
 setIsWalletModalOpen(true);
 }}
 title="Manage Wallet"
 >
 <Wallet size={14} />
 </Button>
 <Button 
 size="icon" 
 variant="ghost" 
 className="w-9 h-9 rounded-app admin-dash-header-bg admin-dash-text-main hover:bg-primary hover:text-white transition-all "
 onClick={() => {
 setCurrentUser(user);
 setIsEditModalOpen(true);
 }}
 >
 <Edit size={14} />
 </Button>
 <Button 
 size="icon" 
 variant="ghost" 
 className="w-9 h-9 rounded-app bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
 onClick={() => deleteUser(user._id || user.id)}
 >
 <Trash2 size={14} />
 </Button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Improved Pagination Bar */}
 <div className="admin-dash-header-bg border-t admin-dash-border p-4 flex flex-col md:flex-row justify-between items-center gap-4">
 <div className="flex items-center gap-4">
 <div className="flex items-center gap-2">
 <span className="text-[9px] font-black admin-dash-text-muted uppercase tracking-widest">Show</span>
 <select 
 className="h-8 rounded-app admin-dash-border admin-dash-card px-2 text-[10px] font-black admin-dash-text-main outline-none focus:ring-2 focus:ring-primary/20 transition-all "
 value={itemsPerPage}
 onChange={(e) => {
 setItemsPerPage(Number(e.target.value));
 setCurrentPage(1);
 }}
 >
 <option value={5}>5</option>
 <option value={10}>10</option>
 <option value={20}>20</option>
 <option value={50}>50</option>
 </select>
 </div>
 <p className="text-[9px] font-bold admin-dash-text-muted uppercase tracking-widest">
 Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} principals
 </p>
 </div>

 <div className="flex items-center gap-1.5">
 <Button 
 variant="outline" 
 size="sm" 
 className="h-8 px-3 rounded-app admin-dash-border admin-dash-card text-[9px] font-black uppercase tracking-widest admin-dash-text-muted disabled:opacity-30 transition-all hover:bg-primary/5"
 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
 disabled={currentPage === 1}
 >
 Prev
 </Button>
 
 <div className="flex items-center gap-1 mx-2">
 {getPaginationRange().map((page, idx) => (
 page === "..." ? (
 <div key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center admin-dash-text-muted font-bold text-[10px]">...</div>
 ) : (
 <button
 key={`page-${page}`}
 onClick={() => setCurrentPage(Number(page))}
 className={`w-8 h-8 rounded-app text-[10px] font-black transition-all ${
 currentPage === page 
 ? 'bg-primary text-white' 
 : 'admin-dash-card admin-dash-text-muted hover:bg-primary/5'
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
 className="h-8 px-3 rounded-app admin-dash-border admin-dash-card text-[9px] font-black uppercase tracking-widest admin-dash-text-muted disabled:opacity-30 transition-all hover:bg-primary/5"
 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
 disabled={currentPage === totalPages}
 >
 Next
 </Button>
 </div>
 </div>
 </div>

 {/* Add User Modal */}
 <Modal
 isOpen={isAddModalOpen}
 onClose={() => setIsAddModalOpen(false)}
 title={t.users.addUser}
 description="Register a new principal into the infrastructure"
 icon={<UserPlus size={24} />}
 className="max-w-2xl"
 >
 <form onSubmit={handleAddUser} className="space-y-6">
 {/* Tier 1: Identity & Avatar */}
 <div className="flex gap-6 items-start">
 <div className="w-24 h-24 rounded-app bg-[var(--admin-bg)] border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center text-[var(--admin-text-muted)] shrink-0 group hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden">
 {newUser.profileImage ? (
 <img src={newUser.profileImage} className="w-full h-full object-cover" alt="" />
 ) : (
 <>
 <ImageIcon size={24} />
 <span className="text-[8px] font-black uppercase mt-2">Avatar</span>
 </>
 )}
 <input 
 type="text" 
 placeholder="URL" 
 className="absolute inset-0 opacity-0 cursor-pointer" 
 onChange={(e) => setNewUser({...newUser, profileImage: e.target.value})}
 />
 </div>
 <div className="flex-1 grid grid-cols-2 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">First Name</label>
 <Input 
 placeholder="e.g. John"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] focus:bg-[var(--admin-card-bg)] transition-all font-bold px-4 text-xs text-[var(--admin-text-main)]"
 value={newUser.firstName}
 onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
 required
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Last Name</label>
 <Input 
 placeholder="e.g. Doe"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] focus:bg-[var(--admin-card-bg)] transition-all font-bold px-4 text-xs text-[var(--admin-text-main)]"
 value={newUser.lastName}
 onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
 required
 />
 </div>
 <div className="col-span-2">
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Display Identity</label>
 <Input 
 placeholder="e.g. CaptainJohn (Optional)"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] focus:bg-[var(--admin-card-bg)] transition-all font-bold px-4 text-xs text-[var(--admin-text-main)]"
 value={newUser.displayName}
 onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
 />
 </div>
 </div>
 </div>

 {/* Tier 2: Governance & Contact */}
 <div className="bg-[var(--admin-bg)]/50 p-6 rounded-app border border-[var(--admin-border)] space-y-6">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Email Protocol</label>
 <Input 
 type="email"
 placeholder="name@domain.com"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] font-bold px-4 text-xs text-[var(--admin-text-main)]"
 value={newUser.email}
 onChange={(e) => setNewUser({...newUser, email: e.target.value})}
 required
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Mobile Protocol</label>
 <Input 
 placeholder="+1 234 567 890"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] font-bold px-4 text-xs text-[var(--admin-text-main)]"
 value={newUser.phone}
 onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
 />
 </div>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Role</label>
 <select 
 className="w-full h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-4 text-xs font-bold text-[var(--admin-text-main)] outline-none"
 value={newUser.role}
 onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
 >
 <option value="user">Customer</option>
 <option value="admin">Admin</option>
 </select>
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Status</label>
 <select 
 className="w-full h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-4 text-xs font-bold text-[var(--admin-text-main)] outline-none"
 value={newUser.status}
 onChange={(e) => setNewUser({...newUser, status: e.target.value})}
 >
 <option>Active</option>
 <option>Inactive</option>
 </select>
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Initial Password</label>
 <Input 
 type="password"
 placeholder="Required"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] font-bold px-4 text-xs text-[var(--admin-text-main)]"
 value={newUser.password}
 onChange={(e) => setNewUser({...newUser, password: e.target.value})}
 required
 />
 </div>
 </div>
 </div>

 {/* Tier 3: Physical Access (Geospatial) */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 px-1">
 <MapPin size={14} className="text-primary" />
 <span className="text-[9px] font-black text-[var(--admin-text-main)] uppercase tracking-widest">Geospatial Metadata</span>
 </div>

 <div className="space-y-1">
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Identity Location Protocol (OSM Search)</label>
 <div className="relative">
 <Input 
 placeholder="Search for an address..."
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] font-bold px-4 text-xs text-[var(--admin-text-main)]"
 onChange={(e) => fetchAddressSuggestions(e.target.value)}
 />
 {addressSuggestions.length > 0 && (
 <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] p-2">
 {addressSuggestions.map((s, i) => (
 <button
 key={i}
 type="button"
 onClick={() => {
 // Simple parsing logic
 const addr = s.address || {};
 setNewUser({
 ...newUser,
 address: s.display_name,
 street: addr.road || addr.pedestrian || addr.suburb || "",
 city: addr.city || addr.town || addr.village || "",
 state: addr.state || "",
 postalCode: addr.postcode || "",
 lat: parseFloat(s.lat),
 lon: parseFloat(s.lon)
 });
 setAddressSuggestions([]);
 }}
 className="w-full text-left px-4 py-3 rounded-app hover:bg-primary/5 transition-all text-[10px] font-bold text-[var(--admin-text-muted)] flex items-center gap-3 border-b border-[var(--admin-border)] last:border-none"
 >
 <MapPin size={12} className="text-primary shrink-0" />
 <span className="truncate">{s.display_name}</span>
 </button>
 ))}
 </div>
 )}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Door No / Flat</label>
 <Input 
 placeholder="e.g. 12/A"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 font-bold text-xs text-[var(--admin-text-main)]"
 value={newUser.doorNo}
 onChange={(e) => setNewUser({...newUser, doorNo: e.target.value})}
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Street / Area</label>
 <Input 
 placeholder="e.g. Sunset Blvd"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 font-bold text-xs text-[var(--admin-text-main)]"
 value={newUser.street}
 onChange={(e) => setNewUser({...newUser, street: e.target.value})}
 />
 </div>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">City</label>
 <Input 
 placeholder="City"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 font-bold text-xs text-[var(--admin-text-main)]"
 value={newUser.city}
 onChange={(e) => setNewUser({...newUser, city: e.target.value})}
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Province/State</label>
 <Input 
 placeholder="State"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 font-bold text-xs text-[var(--admin-text-main)]"
 value={newUser.state}
 onChange={(e) => setNewUser({...newUser, state: e.target.value})}
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Postal Code</label>
 <Input 
 placeholder="Zip"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 font-bold text-xs text-[var(--admin-text-main)]"
 value={newUser.postalCode}
 onChange={(e) => setNewUser({...newUser, postalCode: e.target.value})}
 />
 </div>
 </div>
 
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Latitude</label>
 <Input 
 type="number"
 step="any"
 placeholder="Lat"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 font-bold text-xs text-[var(--admin-text-main)]"
 value={newUser.lat || ""}
 onChange={(e) => setNewUser({...newUser, lat: parseFloat(e.target.value)})}
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Longitude</label>
 <Input 
 type="number"
 step="any"
 placeholder="Lon"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 font-bold text-xs text-[var(--admin-text-main)]"
 value={newUser.lon || ""}
 onChange={(e) => setNewUser({...newUser, lon: parseFloat(e.target.value)})}
 />
 </div>
 </div>
 </div>

 <Button className="w-full h-12 rounded-app bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest text-[11px] transition-all mt-4">
 Sync Principal Identity
 </Button>
 </form>
 </Modal>

 {/* Edit User Modal */}
 <Modal
 isOpen={isEditModalOpen}
 onClose={() => setIsEditModalOpen(false)}
 title={t.users.editUser}
 description="Modify principal metadata and permissions"
 icon={<ShieldCheck size={24} />}
 className="max-w-2xl"
 >
 {currentUser && (
 <form onSubmit={handleEditUser} className="space-y-6">
 {/* Identity Tier */}
 <div className="flex gap-6 items-start">
 <div className="w-24 h-24 rounded-app bg-[var(--admin-bg)] border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center text-[var(--admin-text-muted)] shrink-0 relative overflow-hidden group">
 {currentUser.profileImage ? (
 <img src={currentUser.profileImage} className="w-full h-full object-cover" alt="" />
 ) : (
 <User size={32} />
 )}
 <input 
 type="text" 
 placeholder="Img URL" 
 className="absolute inset-0 opacity-0 cursor-pointer"
 onChange={(e) => setCurrentUser({...currentUser, profileImage: e.target.value})}
 />
 </div>
 <div className="flex-1 grid grid-cols-2 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">First Name</label>
 <Input 
 placeholder="Legal First Name"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 font-bold text-xs text-[var(--admin-text-main)]"
 value={currentUser.firstName}
 onChange={(e) => setCurrentUser({...currentUser, firstName: e.target.value})}
 required
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Last Name</label>
 <Input 
 placeholder="Legal Last Name"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 font-bold text-xs text-[var(--admin-text-main)]"
 value={currentUser.lastName}
 onChange={(e) => setCurrentUser({...currentUser, lastName: e.target.value})}
 required
 />
 </div>
 <div className="col-span-2">
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Display Hub</label>
 <Input 
 placeholder="Platform Identity"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] px-4 font-bold text-xs text-[var(--admin-text-main)]"
 value={currentUser.displayName}
 onChange={(e) => setCurrentUser({...currentUser, displayName: e.target.value})}
 />
 </div>
 </div>
 </div>

 {/* Functional Tier */}
 <div className="bg-[var(--admin-bg)]/50 p-6 rounded-app border border-[var(--admin-border)] space-y-6">
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Email</label>
 <Input 
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] font-bold text-xs text-[var(--admin-text-main)]"
 value={currentUser.email}
 onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
 required
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Phone</label>
 <Input 
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] font-bold text-xs text-[var(--admin-text-main)]"
 value={currentUser.phone || ""}
 onChange={(e) => setCurrentUser({...currentUser, phone: e.target.value})}
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Role</label>
 <select 
 className="w-full h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-4 text-xs font-bold text-[var(--admin-text-main)] outline-none"
 value={currentUser.role}
 onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
 >
 <option value="user">Customer</option>
 <option value="vendor">Vendor</option>
 <option value="admin">Admin</option>
 </select>
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Status</label>
 <select 
 className="w-full h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-4 text-xs font-bold text-[var(--admin-text-main)] outline-none"
 value={currentUser.status}
 onChange={(e) => setCurrentUser({...currentUser, status: e.target.value})}
 >
 <option>Active</option>
 <option>Inactive</option>
 </select>
 </div>
 </div>
 </div>

 {/* Location Tier */}
 <div className="space-y-4">
 <div className="flex items-center gap-2 px-1">
 <MapPin size={14} className="text-primary" />
 <span className="text-[9px] font-black text-[var(--admin-text-main)] uppercase tracking-widest">Geospatial Protocol</span>
 </div>

 <div className="space-y-1">
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Update Location (OSM Search)</label>
 <div className="relative">
 <Input 
 placeholder="Search to update address..."
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-card-bg)] font-bold px-4 text-xs text-[var(--admin-text-main)]"
 onChange={(e) => fetchAddressSuggestions(e.target.value)}
 />
 {addressSuggestions.length > 0 && (
 <div className="absolute top-full left-0 right-0 z-[100] mt-2 bg-[var(--admin-card-bg)] rounded-app border border-[var(--admin-border)] p-2">
 {addressSuggestions.map((s, i) => (
 <button
 key={i}
 type="button"
 onClick={() => {
 // Simple parsing logic
 const addr = s.address || {};
 setCurrentUser({
 ...currentUser,
 address: s.display_name,
 street: addr.road || addr.pedestrian || addr.suburb || "",
 city: addr.city || addr.town || addr.village || "",
 state: addr.state || "",
 postalCode: addr.postcode || "",
 lat: parseFloat(s.lat),
 lon: parseFloat(s.lon)
 });
 setAddressSuggestions([]);
 }}
 className="w-full text-left px-4 py-3 rounded-app hover:bg-primary/5 transition-all text-[10px] font-bold text-[var(--admin-text-muted)] flex items-center gap-3 border-b border-[var(--admin-border)] last:border-none"
 >
 <MapPin size={12} className="text-primary shrink-0" />
 <span className="truncate">{s.display_name}</span>
 </button>
 ))}
 </div>
 )}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Door / Flat</label>
 <Input 
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] font-bold text-xs px-4 text-[var(--admin-text-main)]"
 value={currentUser.doorNo || ""}
 onChange={(e) => setCurrentUser({...currentUser, doorNo: e.target.value})}
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Street</label>
 <Input 
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] font-bold text-xs px-4 text-[var(--admin-text-main)]"
 value={currentUser.street || ""}
 onChange={(e) => setCurrentUser({...currentUser, street: e.target.value})}
 />
 </div>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">City</label>
 <Input 
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] font-bold text-xs px-4 text-[var(--admin-text-main)]"
 value={currentUser.city || ""}
 onChange={(e) => setCurrentUser({...currentUser, city: e.target.value})}
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">State</label>
 <Input 
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] font-bold text-xs px-4 text-[var(--admin-text-main)]"
 value={currentUser.state || ""}
 onChange={(e) => setCurrentUser({...currentUser, state: e.target.value})}
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Zip</label>
 <Input 
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] font-bold text-xs px-4 text-[var(--admin-text-main)]"
 value={currentUser.postalCode || ""}
 onChange={(e) => setCurrentUser({...currentUser, postalCode: e.target.value})}
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Latitude</label>
 <Input 
 type="number"
 step="any"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] font-bold text-xs px-4 text-[var(--admin-text-main)]"
 value={currentUser.lat || 0}
 onChange={(e) => setCurrentUser({...currentUser, lat: parseFloat(e.target.value)})}
 />
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Longitude</label>
 <Input 
 type="number"
 step="any"
 className="h-11 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] font-bold text-xs px-4 text-[var(--admin-text-main)]"
 value={currentUser.lon || 0}
 onChange={(e) => setCurrentUser({...currentUser, lon: parseFloat(e.target.value)})}
 />
 </div>
 </div>
 </div>

 <Button className="w-full h-12 rounded-app bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest text-[11px] transition-all mt-4">
 Update Security Profile
 </Button>
 </form>
 )}
 </Modal>

 {/* Wallet Management Modal */}
 <Modal
 isOpen={isWalletModalOpen}
 onClose={() => setIsWalletModalOpen(false)}
 title="Manage Wallet"
 description={`Update funds for ${currentUser?.displayName || currentUser?.firstName || 'User'}`}
 icon={<Wallet size={24} className="text-purple-600" />}
 className="max-w-md"
 >
 <form onSubmit={handleWalletUpdate} className="space-y-6">
 <div className="flex bg-[var(--admin-bg)] p-1 rounded-app border border-[var(--admin-border)]">
 <button
 type="button"
 onClick={() => setWalletType('credit')}
 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-app translation-all font-black uppercase text-[10px] tracking-widest ${
 walletType === 'credit' ? 'bg-[var(--admin-card-bg)] text-emerald-600 border border-[var(--admin-border)]' : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]'
 }`}
 >
 <ArrowUpCircle size={14} /> Credit (Add)
 </button>
 <button
 type="button"
 onClick={() => setWalletType('debit')}
 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-app translation-all font-black uppercase text-[10px] tracking-widest ${
 walletType === 'debit' ? 'bg-[var(--admin-card-bg)] text-rose-600 border border-[var(--admin-border)]' : 'text-[var(--admin-text-muted)] hover:text-[var(--admin-text-main)]'
 }`}
 >
 <ArrowDownCircle size={14} /> Debit (Deduct)
 </button>
 </div>

 <div className="space-y-4">
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Adjustment Amount</label>
 <div className="relative">
 <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--admin-text-muted)]/30">$</span>
 <Input 
 type="number"
 step="0.01"
 placeholder="0.00"
 className="h-14 pl-10 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] focus:bg-[var(--admin-card-bg)] transition-all font-black text-xl text-[var(--admin-text-main)]"
 value={walletAmount}
 onChange={(e) => setWalletAmount(e.target.value)}
 required
 />
 </div>
 </div>
 <div>
 <label className="text-[9px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest mb-2 block px-1">Description / Reason</label>
 <Input 
 placeholder="e.g. Booking refund, Manual correction"
 className="h-12 rounded-app border-[var(--admin-border)] bg-[var(--admin-bg)] focus:bg-[var(--admin-card-bg)] transition-all font-bold text-xs text-[var(--admin-text-main)]"
 value={walletDescription}
 onChange={(e) => setWalletDescription(e.target.value)}
 required
 />
 </div>
 </div>

 <Button 
 className={`w-full h-14 rounded-app font-black uppercase tracking-widest text-xs transition-all ${
 walletType === 'credit' 
 ? 'bg-emerald-600 hover:bg-emerald-700' 
 : 'bg-rose-600 hover:bg-rose-700'
 } text-white`}
 disabled={walletLoading}
 >
 {walletLoading ? 'Processing...' : `Confirm ${walletType === 'credit' ? 'Credit' : 'Debit'}`}
 </Button>

 <p className="text-[8px] text-center text-[var(--admin-text-muted)] font-bold uppercase tracking-[0.2em] leading-relaxed italic">
 This action will create a transaction record and update the user's available balance across the infrastructure.
 </p>
 </form>
 </Modal>
 {/* Verification Review Modal */}
 <Modal
 isOpen={isVerifOpen}
 onClose={() => setIsVerifOpen(false)}
 title="Document Specification"
 description={selectedVerif ? `Reviewing Evidence for ${selectedVerif.userId?.firstName || 'User'}` : "Credential Evidence Analyzer"}
 icon={<ShieldCheck size={24} className="text-primary" />}
 className="max-w-4xl"
 >
 {verifLoading ? (
 <div className="py-24 flex flex-col items-center gap-4">
 <Loader2 className="w-10 h-10 text-primary animate-spin" />
 <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">Decrypting Identity Evidence...</p>
 </div>
 ) : selectedVerif && (
 <div className="space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {selectedVerif.documents.map((doc: any) => (
 <div key={doc.fieldId} className="space-y-3">
 <p className="text-[10px] font-black text-[var(--admin-text-muted)] uppercase tracking-widest">{doc.fieldName}</p>
 {doc.fieldType === 'image' ? (
 <div 
 onClick={() => setFullImageUrl(doc.value.startsWith('http') ? doc.value : `${BACKEND_URL}${doc.value}`)}
 className="relative aspect-video bg-[var(--admin-bg)] rounded-app overflow-hidden border border-[var(--admin-border)] group cursor-zoom-in"
 >
 <img 
 src={doc.value.startsWith('http') ? doc.value : `${BACKEND_URL}${doc.value}`} 
 className="w-full h-full object-cover transition-transform group-hover:scale-105" 
 alt={doc.fieldName} 
 />
 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-white font-black text-[10px] uppercase tracking-widest gap-2">
 <Eye size={16} /> Inspect Logic
 </div>
 </div>
 ) : (
 <div className="p-4 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-app font-black text-[var(--admin-text-main)]">
 {doc.value}
 </div>
 )}
 </div>
 ))}
 </div>

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
 <X size={20} />
 </button>
 <div className="absolute -bottom-12 left-0 right-0 text-center">
 <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Secure Identity Evidence Storage • Full Resolution Artifact</p>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>

 <div className="space-y-4 pt-6 border-t border-[var(--admin-border)]">
 <div className="flex items-center gap-3 text-[var(--admin-text-muted)]">
 <MessageSquare size={18} />
 <p className="text-[10px] font-black uppercase tracking-widest">Admin Adjudication Summary</p>
 </div>
 <textarea 
 placeholder="Draft feedback for the customer..."
 className="w-full min-h-[100px] border-2 border-[var(--admin-border)] bg-[var(--admin-bg)] rounded-app p-6 font-bold text-[var(--admin-text-main)] focus:bg-[var(--admin-card-bg)] focus:border-primary transition-all text-sm outline-none"
 value={adminNote}
 onChange={(e) => setAdminNote(e.target.value)}
 />
 </div>

 <div className="flex items-center gap-4 pt-4">
 <Button 
 onClick={handleRejectVerif} 
 disabled={processingVerif}
 className="flex-1 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-app font-black uppercase text-[10px] tracking-widest -500/10"
 >
 {processingVerif ? <Loader2 className="animate-spin" /> : <><XCircle size={18} className="mr-2" /> Reject Assets</>}
 </Button>
 <Button 
 onClick={handleApproveVerif} 
 disabled={processingVerif}
 className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-app font-black uppercase text-[10px] tracking-widest -500/10"
 >
 {processingVerif ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} className="mr-2" /> Verify Identity</>}
 </Button>
 </div>
 </div>
 )}
 </Modal>
 </div>
 );
}


