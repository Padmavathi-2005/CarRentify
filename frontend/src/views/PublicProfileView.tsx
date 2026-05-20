"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Star, 
  MapPin, 
  ShieldCheck, 
  Calendar,
  MessageSquare,
  Share2,
  ChevronLeft,
  Car,
  Globe,
  Mail,
  Link as LinkIcon,
  MessageCircle
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CarCard from "@/components/CarCard";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, getImageUrl } from "@/config/api";
import { useLocale } from "@/components/LocaleContext";
import Modal from "@/components/ui/modal";

export default function PublicProfileView() {
  const params = useParams();
  const router = useRouter();
  const idOrSlug = params.slug || params.id;
  const { t, formatPrice } = useLocale();
  
  const [host, setHost] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ averageScore: "0.0", totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = `${API_BASE_URL}/users/${idOrSlug}`;
        const userRes = await fetch(url);
        if (!userRes.ok) throw new Error("Host not found");
        const userData = await userRes.json();
        
        // Redirect to slug if ID was used for SEO consistency
        if (idOrSlug === userData._id && userData.slug) {
          router.replace(`/profile/${userData.slug}`);
          return;
        }
        
        setHost(userData);

        const carsRes = await fetch(`${API_BASE_URL}/cars/vendor/${userData._id}`);
        if (carsRes.ok) {
          const carsData = await carsRes.json();
          setCars(carsData);
        }

        // Fetch host stats
        const statsRes = await fetch(`${API_BASE_URL}/reviews/stats/${userData._id}?isHost=true`);
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        const reviewsRes = await fetch(`${API_BASE_URL}/reviews/host/${userData._id}`);
        if (reviewsRes.ok) {
          setReviews(await reviewsRes.json());
        }
      } catch (err) {
        console.error("Error fetching public profile:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) fetchData();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-20">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !host) {
    return (
      <div className="min-h-screen bg-background flex flex-col pt-20">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <User className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Host Not Found</h2>
          <p className="text-muted-foreground max-w-md mb-8">The host profile you're looking for doesn't exist or has been deactivated.</p>
          <Button onClick={() => router.back()} variant="outline" className="rounded-app">
            Go Back
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const hostName = host.displayName || host.name || (host.firstName ? `${host.firstName} ${host.lastName || ''}`.trim() : 'Premium Host');
  const hostInitial = (host.displayName || host.name || host.firstName || 'H').charAt(0);
  const joinDate = host.createdAt ? new Date(host.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'May 2026';

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-white flex flex-col pt-20">
      <Header />
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-6 py-12">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all mb-10 group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Listing
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: Host Info Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-card border border-border dark:border-white/10 rounded-app p-8 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-muted mb-6 relative group">
                  {host.profileImage ? (
                    <img 
                      src={getImageUrl(host.profileImage)} 
                      alt={hostName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                      <span className="text-4xl font-black text-primary uppercase">{hostInitial}</span>
                    </div>
                  )}
                  {host.isVerified && (
                    <div className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full border-4 border-card">
                      <ShieldCheck size={14} />
                    </div>
                  )}
                </div>
                
                <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">{hostName}</h1>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1 bg-amber-400/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <Star size={12} className="fill-current" />
                      {stats.averageScore} Rating
                    </div>
                    {stats.totalReviews > 0 && (
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {stats.totalReviews} Reviews
                      </div>
                    )}
                  </div>

                <div className="w-full space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground flex items-center gap-2"><Calendar size={14} /> Joined</span>
                    <span className="text-foreground">{joinDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground flex items-center gap-2"><Car size={14} /> Listings</span>
                    <span className="text-foreground">{cars.length} vehicles</span>
                  </div>
                </div>

                <div className="w-full pt-8 space-y-3">
                  <Button 
                    onClick={() => setShowShareModal(true)}
                    variant="outline" 
                    className="w-full h-12 rounded-app font-black uppercase text-[10px] tracking-widest border-border dark:border-white/10 hover:bg-muted transition-all"
                  >
                    <Share2 size={14} className="mr-2" /> Share Profile
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 rounded-app p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Review Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Cleanliness</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className={s <= Math.round(parseFloat(stats.averageScore)) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"} />)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Communication</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className={s <= Math.round(parseFloat(stats.averageScore)) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"} />)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-muted-foreground">Check-in</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className={s <= Math.round(parseFloat(stats.averageScore)) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"} />)}
                  </div>
                </div>
                <p className="text-[10px] font-bold text-muted-foreground/60 italic pt-2 leading-relaxed">
                  "{stats.totalReviews > 0 ? `Showing overall rating based on ${stats.totalReviews} verified reviews.` : "This host hasn't received any reviews yet."}"
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Host Listings */}
          <div className="lg:col-span-9 space-y-10">
            <div className="flex items-end justify-between border-b border-border pb-6">
              <div>
                <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">{hostName.split(' ')[0]}'s Fleet</h2>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-2">Discover curated luxury vehicles from this host</p>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-2xl font-black text-primary">{cars.length}</span>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Listings</p>
              </div>
            </div>

            {cars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map((car, idx) => (
                  <CarCard key={car._id} car={car} index={idx} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-muted/20 rounded-app border border-dashed border-border">
                <Car className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-black text-foreground">No Active Listings</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">This host hasn't posted any vehicles yet.</p>
              </div>
            )}

            <div className="pt-12 space-y-8">
              <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Recent Feedback</h3>
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev._id} className="p-6 bg-card border border-border dark:border-white/10 rounded-app">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-full overflow-hidden flex items-center justify-center font-black text-xs">
                            {rev.user?.profileImage ? <img src={rev.user.profileImage} className="w-full h-full object-cover" /> : (rev.user?.name || "U")[0]}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight">{rev.user?.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {new Date(rev.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • {rev.car?.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= rev.rating ? "currentColor" : "none"} className={s <= rev.rating ? "" : "text-muted-foreground/20"} />)}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center bg-muted/20 rounded-app border border-dashed border-border italic text-muted-foreground/40 text-xs font-bold uppercase tracking-widest">
                    No verified feedback recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Share Profile">
        <div className="p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(typeof window !== 'undefined' ? window.location.href : '');
              alert("Link copied!");
            }}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-14 h-14 rounded-app bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <LinkIcon size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Copy Link</span>
          </button>

          <a 
            href={`mailto:?subject=Check out this host on CarRental&body=Check out ${hostName}'s profile: ${typeof window !== 'undefined' ? window.location.href : ''}`}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-14 h-14 rounded-app bg-muted flex items-center justify-center group-hover:bg-[#EA4335] group-hover:text-white transition-all">
              <Mail size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
          </a>

          <a 
            href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-14 h-14 rounded-app bg-muted flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all">
              <Globe size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
          </a>

          <a 
            href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&text=Check out ${hostName}'s profile on CarRental`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-14 h-14 rounded-app bg-muted flex items-center justify-center group-hover:bg-[#1DA1F2] group-hover:text-white transition-all">
              <MessageCircle size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Twitter</span>
          </a>
        </div>
      </Modal>
    </div>
  );
}
