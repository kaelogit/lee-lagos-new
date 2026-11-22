import Link from "next/link";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";
import { formatSaleDate, PublicSale } from "../lib/sale-shared";

export default function HomeSaleSections({ sales }: { sales: PublicSale[] }) {
  const visible = sales.filter((sale) => sale.products.length > 0);
  if (!visible.length) return null;

  return (
    <>
      {visible.map((sale) => (
        <Reveal key={sale.id}>
          <section id={`sale-${sale.slug}`} className="bg-[#f7f6f4] py-16 lg:py-20">
            <div className="lee-container">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#8a6a2f] mb-3">
                    {sale.discount_percent}% off · Ends {formatSaleDate(sale.ends_at)}
                  </p>
                  <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase tracking-tight text-black">
                    {sale.name}
                  </h2>
                </div>
                <Link
                  href={`/shop/${sale.slug}`}
                  className="inline-flex items-center justify-center border border-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
                >
                  Shop this sale
                </Link>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
                {sale.products.slice(0, 8).map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      ))}
    </>
  );
}
