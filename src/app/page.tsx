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
import SaleBanner from "@/components/SaleBanner";
import HomeSaleSections from "@/components/HomeSaleSections";
import { getLiveSales } from "@/lib/sales";

export const dynamic = "force-dynamic";

export default async function Home() {
  const sales = await getLiveSales();
  const slides = sales.flatMap((sale) =>
    (sale.banners || []).map((src) => ({
      src,
      href: `/shop/${sale.slug}`,
      alt: sale.name,
    }))
  );

  return (
    <div className="pb-20">
      <Navbar />
      <SaleBanner slides={slides} />
      <HeroSlider />
      <HomeSaleSections sales={sales} />
      <NewArrivals />
      <BrandSection />
      <OnSale />
      <Hero />
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