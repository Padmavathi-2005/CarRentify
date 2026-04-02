import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BrandSection from "@/components/BrandSection";
import CategorySection from "@/components/CategorySection";
import FeaturedListings from "@/components/FeaturedListings";
import RecentListings from "@/components/RecentListings";
import FeaturesSection from "@/components/FeaturesSection";
import HostSection from "@/components/HostSection";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <BrandSection />
      <CategorySection />
      <FeaturedListings />
      <RecentListings />
      <FeaturesSection />
      <HostSection />
      <Footer />
    </main>
  );
}
