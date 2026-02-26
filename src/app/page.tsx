import Bestsellers from "@/components/Bestsellers";
import Hero from "../components/Hero";
import BrandSection from "@/components/BrandSection";
import Footer from "@/components/Footer";
import GiftFinder from "@/components/GiftFinder";
import HeroSlider from "@/components/HeroSlider";
import Navbar from "@/components/Navbar";
import NewArrivals from "@/components/NewArrivals";
import SundayDrop from "@/components/SundayDrop";
import TrustSection from "@/components/TrustSection";
import OnSale from "@/components/OnSale";

export default function Home() {
  return (
    <div className="pb-20">
      <Navbar />      
      <HeroSlider />
      <NewArrivals />
      <BrandSection />
      <Hero />
      <OnSale />
      <Bestsellers />
      <SundayDrop />
      <GiftFinder />
      <TrustSection />
      <Footer />
      
      {/* 2. We will add the Trust Badges here next */}
      
      {/* 3. We will add the "New Arrivals" Grid here later */}
    </div>
  );
}