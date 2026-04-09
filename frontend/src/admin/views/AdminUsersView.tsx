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
  MapPin
} from "lucide-react";
import { AdminTranslationContext } from "@/app/admin/AdminTranslationContext";
import { API_BASE_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";

// Mock Data for User Governance
const INITIAL_USERS = [
  { id: 1, name: "Alena Thiel", email: "alena@rentify.io", role: "Admin", status: "Active", joined: "2024-03-15" },
  { id: 2, name: "Marcus Webber", email: "marcus@fleet.pro", role: "Vendor", status: "Active", joined: "2024-04-02" },
  { id: 3, name: "Sarah Jenkins", email: "sarah.j@gmail.com", role: "Customer", status: "Active", joined: "2024-04-10" },
  { id: 4, name: "David Chen", email: "d.chen@enterprise.co", role: "Vendor", status: "Inactive", joined: "2024-01-20" },
  { id: 5, name: "Jessica Bloom", email: "jess@rentify.io", role: "Admin", status: "Active", joined: "2024-02-28" },
];

export default function AdminUsersView() {
  const { t } = useContext(AdminTranslationContext) as any;
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch principals:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u: any) => 
    (u.firstName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (u.lastName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (u.displayName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
    (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (u.phone?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (u.address?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (u.city?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1 flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-xl text-primary"><Users size={20} /></div>
             {t.users.title}
          </h1>
          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">{t.users.desc}</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black hover:bg-black transition-all shadow-xl shadow-black/20 uppercase tracking-widest text-[10px] gap-2"
        >
          <UserPlus size={14} /> {t.users.addUser}
        </Button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <Input 
            placeholder="Search principals by identity, legal hash or mobile protocol..." 
            className="h-11 pl-11 pr-4 border-slate-50 rounded-xl bg-slate-50/50 font-medium focus:bg-white transition-all focus:ring-4 focus:ring-primary/5 border-none text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-100 font-black text-[9px] uppercase tracking-widest text-slate-400 flex-1 md:flex-none">
              Role: All
           </Button>
           <Button variant="outline" className="h-11 px-4 rounded-xl border-slate-100 font-black text-[9px] uppercase tracking-widest text-slate-400 flex-1 md:flex-none">
              Status: Active
           </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.users.table.user || "User"}</th>
                <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.users.table.role || "Role"}</th>
                <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.users.table.contact || "Contact"}</th>
                <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.users.table.location || "Address"}</th>
                <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.users.table.status || "Status"}</th>
                <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.users.table.joined || "Joined"}</th>
                <th className="p-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">{t.users.table.actions || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedUsers.map((user: any) => (
                <tr key={user._id || user.id} className="hover:bg-slate-50/20 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm font-black text-xs uppercase overflow-hidden border border-primary/10">
                        {user.profileImage ? (
                          <img src={user.profileImage} className="w-full h-full object-cover" alt="" />
                        ) : (
                          user.displayName?.charAt(0) || user.firstName?.charAt(0) || user.name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-xs tracking-tight">
                          {user.displayName || (user.firstName || user.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : (user.name || "Unknown Identity"))}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                           <ShieldCheck size={9} /> {user.firstName || "-"} {user.lastName || ""}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-center md:text-left">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      user.role?.toLowerCase() === 'admin' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      user.role?.toLowerCase() === 'vendor' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {user.role || "User"}
                    </span>
                  </td>
                  <td className="p-5">
                     <p className="text-[10px] font-black text-slate-900">{user.phone || "-"}</p>
                     <p className="text-[9px] font-medium text-slate-400 flex items-center gap-1 mt-0.5">
                        <Mail size={10} className="shrink-0" /> {user.email || "-"}
                     </p>
                  </td>
                  <td className="p-5">
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate max-w-[120px]">
                        {user.doorNo ? `${user.doorNo}, ` : ''}
                        {user.street ? `${user.street}, ` : ''}
                        {user.city || user.address || "-"}
                     </p>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' || !user.status ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-300'}`} />
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{user.status || "Active"}</span>
                    </div>
                  </td>
                  <td className="p-5">
                     <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black">
                        <Calendar size={12} />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                     </div>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 transition-all">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-primary hover:text-white transition-all shadow-sm"
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
                        className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
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
        <div className="bg-slate-50/50 border-t border-slate-100 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Show</span>
                 <select 
                    className="h-8 rounded-lg border-slate-200 bg-white px-2 text-[10px] font-black text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
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
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} principals
              </p>
           </div>

           <div className="flex items-center gap-1.5">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 rounded-lg border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-50"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                 Prev
              </Button>
              
              <div className="flex items-center gap-1 mx-2">
                 {[...Array(totalPages)].map((_, i) => (
                    <button
                       key={i + 1}
                       onClick={() => setCurrentPage(i + 1)}
                       className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                          currentPage === i + 1 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-white text-slate-400 hover:bg-slate-50'
                       }`}
                    >
                       {i + 1}
                    </button>
                 ))}
              </div>

              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-3 rounded-lg border-slate-200 bg-white text-[9px] font-black uppercase tracking-widest text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-50"
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
             <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 group hover:border-primary/40 transition-all cursor-pointer relative overflow-hidden">
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
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">First Name</label>
                  <Input 
                    placeholder="e.g. John"
                    className="h-11 rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold px-4 text-xs"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Last Name</label>
                  <Input 
                    placeholder="e.g. Doe"
                    className="h-11 rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold px-4 text-xs"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Display Identity</label>
                  <Input 
                    placeholder="e.g. CaptainJohn (Optional)"
                    className="h-11 rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all font-bold px-4 text-xs"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({...newUser, displayName: e.target.value})}
                  />
                </div>
             </div>
           </div>

           {/* Tier 2: Governance & Contact */}
           <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Email Protocol</label>
                  <Input 
                    type="email"
                    placeholder="name@domain.com"
                    className="h-11 rounded-xl border-slate-100 bg-white shadow-sm font-bold px-4 text-xs"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Mobile Protocol</label>
                  <Input 
                    placeholder="+1 234 567 890"
                    className="h-11 rounded-xl border-slate-100 bg-white shadow-sm font-bold px-4 text-xs"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Role</label>
                  <select 
                    className="w-full h-11 rounded-xl border-slate-100 bg-white shadow-sm px-4 text-xs font-bold text-slate-900 outline-none"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                  >
                     <option value="user">Customer</option>
                     <option value="vendor">Vendor</option>
                     <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Status</label>
                  <select 
                    className="w-full h-11 rounded-xl border-slate-100 bg-white shadow-sm px-4 text-xs font-bold text-slate-900 outline-none"
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                  >
                     <option>Active</option>
                     <option>Inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Initial Password</label>
                  <Input 
                    type="password"
                    placeholder="Required"
                    className="h-11 rounded-xl border-slate-100 bg-white shadow-sm font-bold px-4 text-xs"
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
                 <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Geospatial Metadata</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Door No / Flat</label>
                    <Input 
                      placeholder="e.g. 12/A"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 px-4 font-bold text-xs"
                      value={newUser.doorNo}
                      onChange={(e) => setNewUser({...newUser, doorNo: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Street / Area</label>
                    <Input 
                      placeholder="e.g. Sunset Blvd"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 px-4 font-bold text-xs"
                      value={newUser.street}
                      onChange={(e) => setNewUser({...newUser, street: e.target.value})}
                    />
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">City</label>
                    <Input 
                      placeholder="City"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 px-4 font-bold text-xs"
                      value={newUser.city}
                      onChange={(e) => setNewUser({...newUser, city: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Province/State</label>
                    <Input 
                      placeholder="State"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 px-4 font-bold text-xs"
                      value={newUser.state}
                      onChange={(e) => setNewUser({...newUser, state: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Postal Code</label>
                    <Input 
                      placeholder="Zip"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 px-4 font-bold text-xs"
                      value={newUser.postalCode}
                      onChange={(e) => setNewUser({...newUser, postalCode: e.target.value})}
                    />
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Latitude</label>
                    <Input 
                      type="number"
                      step="any"
                      placeholder="Lat"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 px-4 font-bold text-xs"
                      value={newUser.lat || ""}
                      onChange={(e) => setNewUser({...newUser, lat: parseFloat(e.target.value)})}
                    />
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Longitude</label>
                    <Input 
                      type="number"
                      step="any"
                      placeholder="Lon"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 px-4 font-bold text-xs"
                      value={newUser.lon || ""}
                      onChange={(e) => setNewUser({...newUser, lon: parseFloat(e.target.value)})}
                    />
                 </div>
              </div>
           </div>

           <Button className="w-full h-12 rounded-xl bg-primary hover:bg-black text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 transition-all mt-4">
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
               <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0 relative overflow-hidden group">
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
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">First Name</label>
                    <Input 
                      placeholder="Legal First Name"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 px-4 font-bold text-xs"
                      value={currentUser.firstName}
                      onChange={(e) => setCurrentUser({...currentUser, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Last Name</label>
                    <Input 
                      placeholder="Legal Last Name"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 px-4 font-bold text-xs"
                      value={currentUser.lastName}
                      onChange={(e) => setCurrentUser({...currentUser, lastName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Display Hub</label>
                    <Input 
                      placeholder="Platform Identity"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 px-4 font-bold text-xs"
                      value={currentUser.displayName}
                      onChange={(e) => setCurrentUser({...currentUser, displayName: e.target.value})}
                    />
                  </div>
               </div>
             </div>

             {/* Functional Tier */}
             <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Email</label>
                    <Input 
                      className="h-11 rounded-xl border-slate-100 bg-white font-bold text-xs"
                      value={currentUser.email}
                      onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                      required
                    />
                   </div>
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Phone</label>
                    <Input 
                      className="h-11 rounded-xl border-slate-100 bg-white font-bold text-xs"
                      value={currentUser.phone || ""}
                      onChange={(e) => setCurrentUser({...currentUser, phone: e.target.value})}
                    />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Role</label>
                    <select 
                      className="w-full h-11 rounded-xl border-slate-100 bg-white px-4 text-xs font-bold"
                      value={currentUser.role}
                      onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
                    >
                       <option value="user">Customer</option>
                       <option value="vendor">Vendor</option>
                       <option value="admin">Admin</option>
                    </select>
                   </div>
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Status</label>
                    <select 
                      className="w-full h-11 rounded-xl border-slate-100 bg-white px-4 text-xs font-bold"
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
                   <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Geospatial Protocol</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Door / Flat</label>
                    <Input 
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-xs px-4"
                      value={currentUser.doorNo || ""}
                      onChange={(e) => setCurrentUser({...currentUser, doorNo: e.target.value})}
                    />
                   </div>
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Street</label>
                    <Input 
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-xs px-4"
                      value={currentUser.street || ""}
                      onChange={(e) => setCurrentUser({...currentUser, street: e.target.value})}
                    />
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">City</label>
                    <Input 
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-xs px-4"
                      value={currentUser.city || ""}
                      onChange={(e) => setCurrentUser({...currentUser, city: e.target.value})}
                    />
                   </div>
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">State</label>
                    <Input 
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-xs px-4"
                      value={currentUser.state || ""}
                      onChange={(e) => setCurrentUser({...currentUser, state: e.target.value})}
                    />
                   </div>
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Zip</label>
                    <Input 
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-xs px-4"
                      value={currentUser.postalCode || ""}
                      onChange={(e) => setCurrentUser({...currentUser, postalCode: e.target.value})}
                    />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Latitude</label>
                    <Input 
                      type="number"
                      step="any"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-xs px-4"
                      value={currentUser.lat || 0}
                      onChange={(e) => setCurrentUser({...currentUser, lat: parseFloat(e.target.value)})}
                    />
                   </div>
                   <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Longitude</label>
                    <Input 
                      type="number"
                      step="any"
                      className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-xs px-4"
                      value={currentUser.lon || 0}
                      onChange={(e) => setCurrentUser({...currentUser, lon: parseFloat(e.target.value)})}
                    />
                   </div>
                </div>
             </div>

             <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-black/20 transition-all mt-4">
                Update Security Profile
             </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}


