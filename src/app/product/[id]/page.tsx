import { Metadata } from 'next';
import { supabase } from "../../../lib/supabase";
import ProductClientPage from "./ProductClientPage";

// ==========================================
// DYNAMIC METADATA FOR LINK SHARING
// ==========================================
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  // THE FIX: In Next.js 15, we must 'await' the params before using them!
  const resolvedParams = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (!product) {
    return {
      title: 'Piece Not Found | LEE LAGOS',
    }
  }

  const activePrice = product.is_drop && product.early_access_price 
    ? product.early_access_price 
    : product.on_sale && product.sale_price 
      ? product.sale_price 
      : product.price;

  const description = product.description 
    ? product.description.substring(0, 150) + "..." 
    : "Discover this masterpiece at Lee Lagos.";

  return {
    title: product.name,
    description: `₦${Number(activePrice).toLocaleString()} - ${description}`,
    openGraph: {
      title: `${product.name} | LEE LAGOS`,
      description: `₦${Number(activePrice).toLocaleString()} - ${description}`,
      images: [
        {
          url: product.images[0] || '/og-image.jpg',
          width: 800,
          height: 800,
          alt: product.name,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | LEE LAGOS`,
      description: `₦${Number(activePrice).toLocaleString()}`,
      images: [product.images[0] || '/og-image.jpg'],
    }
  }
}

export default async function ProductPageWrapper({ params }: { params: Promise<{ id: string }> }) {
  // THE FIX: Await the params here too!
  const resolvedParams = await params;
  return <ProductClientPage id={resolvedParams.id} />;
}