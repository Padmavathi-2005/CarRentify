"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Heart, 
  Share2, 
  MapPin, 
  Star, 
  Fuel, 
  Gauge, 
  User as UserIcon, 
  Briefcase, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Phone, 
  Mail, 
  MessageSquare, 
  Info, 
  Settings,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Calendar,
  Zap,
  ShieldCheck,
  FileText,
  Send,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/AuthContext";
import { API_BASE_URL } from "@/config/api";

// Reference Design: High-Fidelity Vehicle Presentation Hub
export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [activeImg, setActiveImg] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");
  
  // Review Flow State
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
     // Fetch Existing Reviews
     fetch(`${API_BASE_URL}/reviews/car/${params.id}`)
       .then(res => res.json())
       .then(data => setReviews(data))
       .catch(err => console.error("Review fetch error:", err));
  }, [params.id]);

  const handleReviewSubmit = async () => {
     if (!user?.id) return;
     setSubmitting(true);
     try {
        const res = await fetch(`${API_BASE_URL}/reviews`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
              user: user.id,
              car: params.id,
              rating,
              comment,
              isVerifiedPurchase: true
           })
        });
        if (res.ok) {
           const newReview = await res.json();
           setReviews([ { ...newReview, user: { name: user.displayName || user.name, profileImage: user.profileImage } }, ...reviews ]);
           setComment("");
           setRating(5);
        }
     } catch (err) {
        console.error("Review submission failed:", err);
     } finally {
        setSubmitting(false);
     }
  };

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const images = [
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1974",
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=1915",
    "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1935",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920"
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-primary selection:text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20 mt-10">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
           <Link href="/" className="hover:text-primary transition-colors">Home</Link>
           <ChevronRight size={12} className="text-slate-200" />
           <Link href="/vehicles" className="hover:text-primary transition-colors">Cars</Link>
           <ChevronRight size={12} className="text-slate-200" />
           <span className="text-slate-900 border-b-2 border-primary/20 pb-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] md:max-w-none">
              Mercedes-Benz C300 4MATIC 2024
           </span>
        </div>

        {/* High-Fidelity Hero Gallery */}
        <section className="mb-12 space-y-4">
           <div className="relative aspect-[21/9] rounded-3xl overflow-hidden bg-slate-200 border border-slate-100 shadow-2xl group">
              <img 
                src={images[activeImg]} 
                alt="Main" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              
              {/* Image Control Overlay */}
              <div className="absolute bottom-10 left-10 flex gap-3">
                 <button onClick={() => setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1))} className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-xl hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 active:scale-95">
                    <ChevronRight className="rotate-180" size={20} />
                 </button>
                 <button onClick={() => setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0))} className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-900 shadow-xl hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 active:scale-95">
                    <ChevronRight size={20} />
                 </button>
              </div>
              <div className="absolute bottom-10 right-10 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl border border-slate-100">
                 <ImageIcon size={14} className="text-primary" />
                 View 24 Photos
              </div>
           </div>

           {/* Thumbnails */}
           <div className="grid grid-cols-6 gap-4 h-24 overflow-hidden">
              {images.map((img, i) => (
                 <div 
                   key={i} 
                   onClick={() => setActiveImg(i)}
                   className={`rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${activeImg === i ? 'border-primary ring-4 ring-primary/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                 >
                    <img src={img} className="w-full h-full object-cover" />
                 </div>
              ))}
           </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-12 items-start h-full">
           
           {/* Detailed Content Hub */}
           <div className="flex-1 space-y-12 w-full min-w-0">
              
              {/* Product Profile Header */}
              <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                 <div className="flex flex-col gap-6 relative z-10">
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full w-fit text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                       <Zap size={10} fill="currentColor" /> Ready for instant pickup
                    </div>
                    <div>
                       <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">Mercedes-Benz C300 4MATIC 2024</h1>
                       <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-400">
                          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> London, UK (Mayfair Hub)</span>
                          <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-400 fill-amber-400" /> 4.98 ({reviews.length} Reviews)</span>
                          <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"><Share2 size={14} /> Share Experience</span>
                       </div>
                    </div>
                 </div>

                 {/* High-Fidelity Specification Tiles */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 bg-slate-50/50 p-4 rounded-2xl">
                    {[
                      { icon: Fuel, label: "Octane 98 Premium", val: "Gasoline" },
                      { icon: Settings, label: "Auto-6 Shift", val: "Transmission" },
                      { icon: UserIcon, label: "5 Luxury Seats", val: "Capacity" },
                      { icon: Gauge, label: "0-100 in 6.2s", val: "Performance" }
                    ].map((spec, i) => (
                      <div key={i} className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 shadow-sm group hover:border-primary/20 transition-all cursor-default">
                         <spec.icon size={20} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{spec.val}</p>
                         <p className="text-xs font-black text-slate-900">{spec.label}</p>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Information Accordion Modules */}
              <div className="space-y-6">
                 {/* Overview Section */}
                 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
                    <button 
                      onClick={() => toggleSection('overview')}
                      className="w-full flex items-center justify-between p-8 text-left"
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                             <FileText size={18} />
                          </div>
                          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Overview</h2>
                       </div>
                       {expandedSection === 'overview' ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
                    </button>
                    {expandedSection === 'overview' && (
                       <div className="p-10 pt-0 text-slate-500 font-medium leading-relaxed animate-fade-in text-sm border-t border-slate-50 bg-slate-50/10">
                          The Mercedes-Benz C300 4MATIC represents the ultimate fusion of contemporary luxury and athletic performance. Powered by a turbocharged 2.0-liter inline-4 engine mated to a 48-volt mild hybrid system, this vessel delivers an effortless 255 horsepower and 295 lb-ft of torque.
                          <br /><br />
                          Experience a digital-first cockpit inspired by the S-Class, featuring a portrait-oriented 11.9-inch multimedia touchscreen and a 12.3-inch digital instrument cluster. Every detail has been meticulously synchronized for a world-class journey.
                       </div>
                    )}
                 </div>

                 {/* Accessories Section */}
                 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group">
                    <button 
                      onClick={() => toggleSection('acc')}
                      className="w-full flex items-center justify-between p-8 text-left"
                    >
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all">
                             <Briefcase size={18} />
                          </div>
                          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Accessories & Features</h2>
                       </div>
                       {expandedSection === 'acc' ? <ChevronUp size={20} className="text-slate-300" /> : <ChevronDown size={20} className="text-slate-300" />}
                    </button>
                    {expandedSection === 'acc' && (
                       <div className="p-10 pt-0 animate-fade-in border-t border-slate-50">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-10 py-4">
                             {[
                               "Burmester 3D Sound", "Panoramic Sunroof", "Adaptive Cruise", 
                               "360 Surround View", "Ventilated Seats", "Heated Steering",
                               "Ambient Lighting", "Wireless Charging", "Head-Up Display"
                             ].map(feat => (
                               <div key={feat} className="flex items-center gap-3">
                                  <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500">
                                     <CheckCircle2 size={12} />
                                  </div>
                                  <span className="text-xs font-bold text-slate-600">{feat}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>
              </div>

              {/* World-Class Review Experience Hub */}
              <section className="space-y-10">
                 <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                       <Star className="text-primary fill-primary" size={24} />
                       <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase tracking-widest">Feedback Hub <span className="text-slate-400 opacity-50 ml-2">({reviews.length})</span></h2>
                    </div>
                    {user?.id ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100/50">
                         <UserCheck size={10} fill="currentColor" /> Synchronized Reviewing
                      </div>
                    ) : (
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Login to contribute</p>
                    )}
                 </div>

                 {/* Review Creation Gateway */}
                 {user?.id && (
                    <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group/form">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                       <div className="space-y-8 relative z-10">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                             <div className="space-y-1">
                                <h3 className="text-lg font-black text-slate-900 leading-none">Share Your Journey</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contribute to the global vehicle reputation hub.</p>
                             </div>
                             {/* Star Selector */}
                             <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                {[1,2,3,4,5].map((s) => (
                                  <Star 
                                    key={s} 
                                    onClick={() => setRating(s)}
                                    className={`w-6 h-6 cursor-pointer transition-all ${s <= rating ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`} 
                                  />
                                ))}
                             </div>
                          </div>
                          
                          <div className="relative">
                             <Textarea 
                               placeholder="Synchronize your thoughts on this Mercedes-Benz Experience..."
                               className="h-32 bg-slate-50 border-none rounded-2xl px-6 py-6 font-bold text-sm placeholder:text-slate-300 resize-none focus-visible:ring-primary/20"
                               value={comment}
                               onChange={(e) => setComment(e.target.value)}
                             />
                             <Button 
                                onClick={handleReviewSubmit}
                                disabled={submitting || !comment}
                                className="absolute bottom-4 right-4 h-12 px-8 bg-primary hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 border-none disabled:opacity-50"
                             >
                                {submitting ? "Submitting..." : (
                                   <div className="flex items-center gap-2">
                                      Post Review <Send size={12} strokeWidth={3} />
                                   </div>
                                )}
                             </Button>
                          </div>
                       </div>
                    </div>
                 )}

                 {/* Reviews Gallery */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    {reviews.length > 0 ? (
                      reviews.map((rev, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative group hover:shadow-xl hover:shadow-slate-100/50 transition-all">
                           <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border-2 border-slate-50 ring-4 ring-primary/5">
                                    <img src={rev.user?.profileImage || `https://i.pravatar.cc/150?u=${rev.user?._id}`} className="w-full h-full object-cover" />
                                 </div>
                                 <div className="text-left">
                                    <h4 className="text-sm font-black text-slate-900 leading-none mb-1">{rev.user?.name}</h4>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg">
                                 {[...Array(5)].map((_, idx) => (
                                    <Star key={idx} size={8} className={idx < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-100'} />
                                 ))}
                              </div>
                           </div>
                           <p className="text-sm font-bold text-slate-600 leading-relaxed italic line-clamp-3 group-hover:line-clamp-none transition-all">"{rev.comment}"</p>
                           {rev.isVerifiedPurchase && (
                             <div className="mt-6 flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                <ShieldCheck size={12} fill="currentColor" /> Verified Synchronized Driver
                             </div>
                           )}
                        </div>
                      ))
                    ) : (
                       <div className="md:col-span-2 py-20 text-center space-y-4">
                          <MessageSquare className="mx-auto text-slate-200" size={40} />
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No reviews synchronized yet.</p>
                       </div>
                    )}
                 </div>
              </section>
           </div>

           {/* Booking Sidebar - Sticky Master Control */}
           <div className="w-full lg:w-[420px] space-y-8 lg:sticky lg:top-24">
              <div className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                 
                 <div className="flex items-center justify-between mb-10 relative z-10">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pricing</p>
                       <h2 className="text-3xl font-black text-slate-900">$185.00 <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">/ day</span></h2>
                    </div>
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary border border-primary/10">
                       <Zap size={22} fill="currentColor" />
                    </div>
                 </div>

                 <div className="space-y-6 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Pickup Hub</label>
                          <div className="relative">
                             <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                             <Input placeholder="Date" className="h-12 pl-12 rounded-xl bg-slate-50 border-none font-bold text-xs" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Drop-off</label>
                          <div className="relative">
                             <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                             <Input placeholder="Time" className="h-12 pl-12 rounded-xl bg-slate-50 border-none font-bold text-xs" />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-50">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Optional Ecosystem Extras</p>
                       <div className="space-y-3">
                          {[
                            { id: 'ins', label: 'Collision Damage Waiver', price: 25 },
                            { id: 'ch', label: 'Child Safety Seat', price: 15 },
                            { id: 'wifi', label: 'Unlimited 5G Wi-Fi Hub', price: 10 }
                          ].map(extra => (
                            <div key={extra.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all cursor-pointer group/extra">
                               <div className="flex items-center gap-3">
                                  <div className="w-5 h-5 rounded-md border-2 border-slate-200 group-hover/extra:border-primary transition-all overflow-hidden relative">
                                     <div className="absolute inset-0 bg-primary opacity-0 group-hover/extra:opacity-10 shadow-inner" />
                                  </div>
                                  <span className="text-xs font-bold text-slate-700">{extra.label}</span>
                               </div>
                               <span className="text-[10px] font-black text-primary uppercase">+${extra.price}</span>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="pt-8 space-y-4">
                       <div className="flex justify-between items-center px-2">
                          <span className="text-xs font-bold text-slate-400">Security Deposit (Refundable)</span>
                          <span className="text-xs font-black text-slate-900">$500.00</span>
                       </div>
                       <div className="flex justify-between items-center px-4 py-5 bg-primary/5 rounded-xl border border-primary/10">
                          <span className="text-sm font-black text-primary uppercase tracking-widest">Estimated Total</span>
                          <span className="text-xl font-black text-primary">$235.00</span>
                       </div>
                    </div>

                    <Button className="w-full h-16 bg-primary hover:bg-black text-white text-sm font-black uppercase tracking-widest rounded-xl mt-6 shadow-2xl shadow-primary/20 transition-all active:scale-95 border-none">
                       Synchronize Booking
                    </Button>
                    <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-4 flex items-center justify-center gap-2">
                       <ShieldCheck size={12} /> Level 1 Encrypted Checkout
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <Footer />
      
      {/* Visual Integrity Styles */}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
