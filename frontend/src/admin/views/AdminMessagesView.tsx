"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
 Search, 
 MessageSquare, 
 User, 
 Send, 
 MoreVertical, 
 Phone, 
 Video, 
 Info,
 CheckCheck,
 Clock,
 ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "../styles/AdminDashboardView.css";

import { API_BASE_URL } from "@/config/api";
import { authService } from "@/services/authService";

export default function AdminMessagesView() {
 const [conversations, setConversations] = useState<any[]>([]);
 const [activeChat, setActiveChat] = useState<any>(null);
 const [messages, setMessages] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [msg, setMsg] = useState("");
 const [showChat, setShowChat] = useState(false);

 React.useEffect(() => {
 fetchConversations();
 }, []);

 const fetchConversations = async () => {
 try {
 const user = authService.getAdminUser();
 if (!user) return;
 const res = await fetch(`${API_BASE_URL}/chat/conversations/${user._id || user.id}`);
 if (res.ok) {
 const data = await res.json();
 setConversations(data);
 if (data.length > 0 && !activeChat) {
 setActiveChat(data[0]);
 fetchMessages(data[0]._id);
 }
 }
 } catch (err) {
 console.error("Fetch conversations failed:", err);
 } finally {
 setLoading(false);
 }
 };

 const fetchMessages = async (convId: string) => {
 try {
 const res = await fetch(`${API_BASE_URL}/chat/messages/${convId}`);
 if (res.ok) setMessages(await res.json());
 } catch (err) { console.error(err); }
 };

 const handleSendMessage = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!msg.trim() || !activeChat) return;
 // Integration with WebSocket/API would go here
 setMsg("");
 };

 return (
 <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] admin-dash-card rounded-app overflow-hidden border border-slate-200 dark:border-slate-700 bg-[var(--admin-card-bg)] shadow-sm">
 {/* Sidebar */}
 <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-700 flex flex-col admin-dash-header-bg ${showChat ? 'hidden md:flex' : 'flex'}`}>
 <div className="p-6 border-b admin-dash-border admin-dash-card">
 <h2 className="text-xl font-black admin-dash-text-main mb-4 flex items-center gap-2">
 <MessageSquare size={20} className="text-primary" /> Messages
 </h2>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 admin-dash-text-muted" size={14} />
 <Input placeholder="Search discussions..." className="pl-9 h-10 text-xs rounded-app admin-dash-border admin-dash-header-bg focus:bg-primary/5 admin-dash-text-main transition-all" />
 </div>
 </div>
 
 <div className="flex-1 overflow-y-auto p-3 space-y-2">
 {loading ? (
 <div className="p-10 text-center text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)] animate-pulse">Syncing...</div>
 ) : conversations.length === 0 ? (
 <div className="p-10 text-center">
 <div className="w-12 h-12 bg-primary/5 rounded-app flex items-center justify-center text-primary mx-auto mb-4 opacity-20">
 <MessageSquare size={24} />
 </div>
 <p className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-text-muted)]">No Active Discussions</p>
 </div>
 ) : conversations.map((chat) => (
 <div 
 key={chat._id}
 className={`p-4 rounded-app cursor-pointer transition-all flex items-center gap-4 border ${
 activeChat?._id === chat._id 
 ? 'bg-[var(--admin-card-bg)] border-primary/20 shadow-sm' 
 : 'border-transparent hover:bg-primary/5 dark:hover:bg-white/5'
 }`}
 onClick={() => {
 setActiveChat(chat);
 fetchMessages(chat._id);
 setShowChat(true);
 }}
 >
 <div className="relative">
 <div className="w-12 h-12 admin-dash-header-bg rounded-app flex items-center justify-center admin-dash-text-muted">
 <User size={20} />
 </div>
 {chat.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[var(--admin-card-bg)] rounded-full" />}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-center mb-1">
 <h4 className="font-black admin-dash-text-main text-xs truncate">{chat.participants?.[0]?.firstName || "User"}</h4>
 <span className="text-[9px] font-bold admin-dash-text-muted">{new Date(chat.updatedAt).toLocaleDateString()}</span>
 </div>
 <p className="text-[10px] admin-dash-text-muted truncate">{chat.lastMessage?.text || "No messages yet"}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 
 {/* Chat Area */}
 <div className={`flex-1 flex flex-col bg-[var(--admin-card-bg)] ${!showChat ? 'hidden md:flex' : 'flex'}`}>
 {!activeChat ? (
 <div className="flex-1 flex items-center justify-center p-8 md:p-12">
 <div className="max-w-sm w-full bg-[var(--admin-bg)]/60 border border-slate-200 dark:border-slate-700 rounded-app p-10 text-center shadow-md backdrop-blur-md">
 <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
 <MessageSquare size={40} className="opacity-40" />
 </div>
 <h3 className="text-xl font-black admin-dash-text-main mb-2">Select a Conversation</h3>
 <p className="text-xs font-bold admin-dash-text-muted leading-relaxed">Pick a discussion from the left sidebar to start messaging with your users.</p>
 </div>
 </div>
 ) : (
 <>
 {/* Chat Header */}
 <div className="p-4 border-b admin-dash-border flex items-center justify-between bg-[var(--admin-bg)]/30 backdrop-blur-sm">
 <div className="flex items-center gap-4">
 <button 
 onClick={() => setShowChat(false)}
 className="md:hidden p-2 hover:bg-primary/10 rounded-app text-primary"
 >
 <ChevronLeft size={20} />
 </button>
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 bg-primary/5 rounded-app flex items-center justify-center text-primary">
 <User size={18} />
 </div>
 <div>
 <h3 className="font-black admin-dash-text-main text-sm">{activeChat.participants?.[0]?.firstName || "User"}</h3>
 <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Now</p>
 </div>
 </div>
 </div>
 </div>
 
 {/* Messages Log */}
 <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-primary/5 dark:bg-transparent custom-scrollbar">
 {messages.length === 0 && (
 <div className="flex justify-center py-20">
 <span className="px-4 py-1 admin-dash-card border admin-dash-border rounded-full text-[9px] font-black admin-dash-text-muted uppercase tracking-widest ">No Messages Yet</span>
 </div>
 )}
 {messages.map((m: any) => (
 <div key={m._id} className={`flex items-start gap-4 ${m.sender === authService.getAdminUser()?._id ? 'ml-auto justify-end max-w-[70%]' : 'max-w-[70%]'}`}>
 {m.sender !== authService.getAdminUser()?._id && (
 <div className="w-8 h-8 rounded-app admin-dash-header-bg flex items-center justify-center admin-dash-text-muted shrink-0"><User size={14} /></div>
 )}
 <div className={`space-y-1 ${m.sender === authService.getAdminUser()?._id ? 'text-right' : ''}`}>
 <div className={`p-4 rounded-app text-[11px] font-bold leading-relaxed ${m.sender === authService.getAdminUser()?._id ? 'bg-primary text-white rounded-tr-none' : 'admin-dash-card border admin-dash-border rounded-tl-none admin-dash-text-main'}`}>
 {m.text}
 </div>
 <span className="text-[9px] font-bold admin-dash-text-muted flex items-center gap-2 justify-end">
 {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 {m.sender === authService.getAdminUser()?._id && <CheckCheck size={12} className="text-primary" />}
 </span>
 </div>
 </div>
 ))}
 </div>
 
 {/* Input Area */}
 <div className="p-6 border-t admin-dash-border">
 <form 
 onSubmit={handleSendMessage}
 className="flex items-center gap-4 admin-dash-header-bg p-2 rounded-app border admin-dash-border focus-within:bg-primary/5 focus-within:border-primary/20 transition-all"
 >
 <Input 
 value={msg}
 onChange={(e) => setMsg(e.target.value)}
 placeholder="Type your message..." 
 className="flex-1 bg-transparent border-none focus-visible:ring-0 text-xs admin-dash-text-main font-bold h-10"
 />
 <Button type="submit" size="icon" className="w-10 h-10 bg-primary rounded-app ">
 <Send size={16} />
 </Button>
 </form>
 </div>
 </>
 )}
 </div>
 </div>
 );
}
