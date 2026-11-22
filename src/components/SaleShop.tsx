import Navbar from "./Navbar";
import Footer from "./Footer";
import ProductCard from "./ProductCard";
import SaleBanner, { BannerSlide } from "./SaleBanner";
import { formatSaleDate, PublicSale } from "../lib/sale-shared";

export default function SaleShop({ sale }: { sale: PublicSale }) {
  const slides: BannerSlide[] = (sale.banners || []).map((src) => ({
    src,
    href: `/shop/${sale.slug}`,
    alt: sale.name,
  }));
  const live = sale.status === "live";
  const scheduled = sale.status === "scheduled";

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      {(live || scheduled) && <SaleBanner slides={slides} />}

      <main className="py-12">
        <div className="lee-container">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-600 mb-3">
            {sale.kind}
          </p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold uppercase tracking-tight text-black mb-4">
            {sale.name}
          </h1>

          {live && (
            <p className="text-sm text-gray-600 mb-12">
              {sale.discount_percent}% off until {formatSaleDate(sale.ends_at)}.
            </p>
          )}
          {scheduled && (
            <p className="text-sm text-gray-600 mb-12">
              Starts {formatSaleDate(sale.starts_at)}. The discount turns on then.
            </p>
          )}
          {!live && !scheduled && (
            <p className="text-sm text-gray-600 mb-12">This sale has ended.</p>
          )}

          {sale.products.length === 0 ? (
            <p className="py-16 text-center text-sm uppercase tracking-widest text-gray-400">
              No pieces in this sale yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
              {sale.products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
