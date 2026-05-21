"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Send,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  ChevronLeft,
  User,
  Image as ImageIcon,
  FileText,
  Camera,
  Plus,
  X,
  MapPin,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/components/AuthContext";
import { BACKEND_URL, API_BASE_URL } from "@/config/api";
import { useLocale } from "@/components/LocaleContext";
import { useSearchParams } from "next/navigation";

interface Message {
  _id: string;
  text?: string;
  senderId: string;
  conversationId?: string;
  timestamp?: string;
  createdAt?: string;
  status: "sent" | "delivered" | "read";
  type: 'text' | 'image' | 'location';
  imageUrl?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
}

interface Chat {
  _id: string;
  participants: any[];
  lastMessage?: any;
  updatedAt: string;
}

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

const getInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { user } = useAuth();
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"chats" | "people">("chats");

  // New Chat Modal States (Disabled as per requirements)
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Lightbox state
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when modal is open to prevent scroll-over-header bug
  useEffect(() => {
    if (isNewChatModalOpen || lightboxUrl) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isNewChatModalOpen, lightboxUrl]);

  // Close lightbox on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setLightboxUrl(null); setLightboxZoomed(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);


  const fetchConversations = async () => {
    if (!user?._id) return;
    try {
      const data = await chatService.getConversations(user._id);
      setConversations(data);
      setHasFetched(true);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setHasFetched(true);
    }
  };


  useEffect(() => {
    chatService.connect();
    chatService.onNewMessage((msg: Message) => {
      if (msg.conversationId === activeChatId) {
        setMessages(prev => [...prev, msg]);
      }
      fetchConversations();
    });
    chatService.onConversationUpdated(() => fetchConversations());
    return () => {
      chatService.disconnect();
    };
  }, [activeChatId, user?._id]);

  useEffect(() => {
    fetchConversations();
    
    // Auto-select chat from URL ID
    const chatId = searchParams.get('id');
    if (chatId) {
      setActiveChatId(chatId);
    }
  }, [user?._id, searchParams]);


  const fetchMessages = async (convId: string) => {
    try {
      const data = await chatService.getMessages(convId);
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (activeChatId) {
      chatService.joinConversation(activeChatId);
      fetchMessages(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChatId || !user?._id) return;
    chatService.sendMessage(activeChatId, user._id, newMessage);
    setNewMessage("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChatId || !user?._id) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await fetch(`${API_BASE_URL}/media/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, base64 })
        });
        const data = await res.json();
        if (data.url) {
          chatService.sendMessage(activeChatId, user._id, undefined, 'image', undefined, `${BACKEND_URL}${data.url}`);
        }
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleShareLocation = () => {
    if (!activeChatId || !user?._id) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      // Optional: Get address via reverse geocoding
      let address = "Shared Location";
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        if (data.display_name) address = data.display_name;
      } catch (e) { }

      chatService.sendMessage(activeChatId, user._id, undefined, 'location', { lat: latitude, lng: longitude, address });
    }, (err) => {
      alert("Unable to retrieve your location");
    });
  };

  const startNewChat = async (targetUserId: string) => {
    if (!user?._id) return;
    try {
      const chat = await chatService.startConversation([user._id, targetUserId]);
      setActiveChatId(chat._id);
      setIsNewChatModalOpen(false);
      fetchConversations();
    } catch (err) {
      console.error("Error starting conversation:", err);
    }
  };

  const getActiveChatInfo = () => {
    const chat = conversations.find(c => c._id === activeChatId);
    if (!chat) return null;
    const otherParticipant = chat.participants.find(p => p._id !== user?._id);
    return {
      name: otherParticipant ? (otherParticipant.firstName || otherParticipant.lastName ? `${otherParticipant.firstName || ''} ${otherParticipant.lastName || ''}`.trim() : 'User') : t('dashboard.messages.unknown_user'),
      avatar: otherParticipant?.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      online: true
    };
  };

  const activeChatInfo = getActiveChatInfo();

  return (
    <div className="bg-white dark:bg-slate-950 rounded-app lg:rounded-app border border-slate-100 dark:border-white/10 dark:overflow-hidden flex flex-col lg:flex-row h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-5 duration-1000 relative w-full max-w-full">
      {/* Sidebar */}
      <div className={`w-full lg:w-[380px] border-b lg:border-b-0 lg:border-r border-slate-50 dark:border-white/5 flex flex-col bg-slate-50/30 dark:bg-black/20 ${isMobile && activeChatId ? "hidden" : "flex"} h-full overflow-hidden`}>
        <div className="p-4 lg:p-8 pb-4">
          <div className="flex items-center justify-between mb-6 lg:mb-8">
            <h2 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('dashboard.messages.title')}</h2>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={t('dashboard.messages.search_conv')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-app pl-11 pr-4 text-sm font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-primary/20 transition-all "
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 lg:px-4 py-2 space-y-2 custom-scrollbar">
          {conversations.length > 0 ? (
            conversations
              .filter(c => {
                const other = c.participants.find(p => p._id !== user?._id);
                const name = other ? (other.firstName || other.lastName ? `${other.firstName || ''} ${other.lastName || ''}`.trim() : 'User') : "";
                return name.toLowerCase().includes(searchQuery.toLowerCase());
              })
              .map((chat) => {
                const other = chat.participants.find(p => p._id !== user?._id);
                const name = other ? (other.firstName || other.lastName ? `${other.firstName || ''} ${other.lastName || ''}`.trim() : 'User') : t('dashboard.messages.unknown_user');

                return (
                  <div
                    key={chat._id}
                    onClick={() => setActiveChatId(chat._id)}
                    className={`p-3 lg:p-4 rounded-app cursor-pointer transition-all flex items-center gap-3 lg:gap-4 group msg-item-hover
                      ${activeChatId === chat._id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/20 border border-slate-200/50 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/30'}
                    `}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-app overflow-hidden border-2 border-white/20 relative flex items-center justify-center ${activeChatId === chat._id ? 'bg-white' : 'bg-primary/20'}`}>
                        {other?.profileImage ? (
                          <img src={other.profileImage} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <span className={`font-black text-sm lg:text-base ${activeChatId === chat._id ? 'text-primary' : 'text-primary'}`}>
                            {getInitials(name)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-xs lg:text-sm font-black truncate ${activeChatId === chat._id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{name}</h4>
                        <span className={`text-[10px] font-bold ${activeChatId === chat._id ? 'text-white/70' : 'text-slate-400'}`}>
                          {chat.lastMessage ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </div>
                      <p className={`text-[10px] lg:text-xs font-bold truncate ${activeChatId === chat._id ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {chat.lastMessage?.text || t('dashboard.messages.new_started')}
                      </p>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-10 lg:py-20 px-4 lg:px-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('dashboard.messages.no_chats')}</p>
            </div>
          )}
        </div>
      </div>

      <div className={`flex-1 flex flex-col bg-white dark:bg-slate-950 ${isMobile && !activeChatId ? "hidden" : "flex"} h-full overflow-hidden`}>
        {activeChatId && activeChatInfo ? (
          <>
            <div className="p-4 lg:p-6 border-b border-slate-50 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                {isMobile && (
                  <button onClick={() => setActiveChatId(null)} className="p-2 -ml-2 hover:bg-slate-50 rounded-app transition-all">
                    <ChevronLeft size={20} className="text-slate-900" />
                  </button>
                )}
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-app overflow-hidden border-2 border-slate-50 shrink-0 flex items-center justify-center bg-primary/20">
                  {activeChatInfo.avatar && !activeChatInfo.avatar.includes('unsplash') ? (
                    <img src={activeChatInfo.avatar} alt={activeChatInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-sm lg:text-base text-primary">
                      {getInitials(activeChatInfo.name)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs lg:text-sm font-black text-slate-900 dark:text-white leading-none mb-1 truncate">{activeChatInfo.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('dashboard.messages.active')}</span>
                  </div>
                </div>
              </div>

            </div>

            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 lg:space-y-8 bg-slate-50/20 dark:bg-black/20 custom-scrollbar"
            >
              {messages.map((m) => {
                const isMe = m.senderId === user?._id;
                return (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`rounded-app text-sm font-medium relative overflow-hidden ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-white/5'}`}>
                        {m.type === 'image' ? (
                          <div
                            className="relative group/img cursor-zoom-in overflow-hidden"
                            style={{ width: 150, height: 150, flexShrink: 0 }}
                            onClick={() => { setLightboxUrl(m.imageUrl || null); setLightboxZoomed(false); }}
                          >
                            <img
                              src={m.imageUrl}
                              alt="Shared Image"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              className="hover:brightness-90 transition-all duration-200"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/25 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-200">
                              <ZoomIn size={24} className="text-white drop-shadow-lg" />
                            </div>
                          </div>
                        ) : m.type === 'location' ? (
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin size={16} className={isMe ? "text-white" : "text-primary"} />
                              <span className="font-black text-[10px] uppercase tracking-widest">Shared Location</span>
                            </div>
                            <p className="text-[11px] opacity-80 leading-relaxed font-bold">{m.location?.address}</p>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${m.location?.lat},${m.location?.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`mt-2 block w-full py-2 rounded-app text-[9px] font-black uppercase tracking-widest text-center transition-all ${isMe ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-primary/10 hover:bg-primary/20 text-primary'}`}
                            >
                              Open in Maps
                            </a>
                          </div>
                        ) : (
                          <div className="px-5 py-4">{m.text}</div>
                        )}
                      </div>
                      <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase">{new Date(m.createdAt || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 lg:p-4 bg-white dark:bg-slate-950 border-t border-slate-50 dark:border-white/5 flex items-center gap-2 lg:gap-4">
              <div className="flex items-center">
                <input
                  type="file"
                  id="chat-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="chat-image"
                  className="w-9 h-9 lg:w-10 lg:h-10 text-slate-400 hover:text-primary transition-colors flex items-center justify-center cursor-pointer"
                >
                  <ImageIcon size={18} />
                </label>
                <button
                  onClick={handleShareLocation}
                  className="w-9 h-9 lg:w-10 lg:h-10 text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
                  title="Share Location"
                >
                  <MapPin size={18} />
                </button>
              </div>
              <div className="flex-1 relative">
                <input
                  type="text" value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={t('dashboard.messages.placeholder')}
                  className="w-full h-11 lg:h-14 bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-app lg:rounded-app px-4 text-xs lg:text-sm font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-white/10 focus:border-primary/20"
                />
              </div>
              <button onClick={handleSendMessage} className="h-11 w-11 lg:h-14 lg:w-14 rounded-app lg:rounded-app bg-primary hover:bg-primary-hover flex items-center justify-center text-white active:scale-95 transition-all outline-none border-none">
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50/30 dark:bg-black/20">
            <Send size={48} className="text-primary -rotate-12 mb-8 opacity-20" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{t('dashboard.messages.connect_title')}</h2>
            <p className="max-w-[340px] text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.messages.connect_desc')}</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f1f5f9; border-radius: 10px; }
        
        /* Forced Dark Mode Hover Fix */
        .dark .msg-item-hover:hover {
          background-color: #0f172a !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
            onClick={() => { setLightboxUrl(null); setLightboxZoomed(false); }}
          >
            {/* Close button */}
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxUrl(null); setLightboxZoomed(false); }}
              className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10 backdrop-blur-sm border border-white/20"
            >
              <X size={20} />
            </button>

            {/* Zoom toggle button */}
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxZoomed(z => !z); }}
              className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-10 backdrop-blur-sm border border-white/20"
            >
              {lightboxZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
            </button>

            {/* Image wrapper — forces full size via inline styles */}
            <motion.div
              key={lightboxUrl}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: lightboxZoomed ? 1.5 : 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '88vw',
                height: '82vh',
                cursor: lightboxZoomed ? 'zoom-out' : 'zoom-in',
              }}
              className="rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src={lightboxUrl}
                alt="Full preview"
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#111' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
