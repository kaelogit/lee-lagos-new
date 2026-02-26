import { Metadata } from 'next';
import { supabase } from "../../../lib/supabase";
import ProductClientPage from "./ProductClientPage"; // We are moving the interactive part to a client component

// ==========================================
// DYNAMIC METADATA FOR LINK SHARING
// ==========================================
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) {
    return {
      title: 'Piece Not Found | LEE LAGOS',
    }
  }

  // Calculate the correct price to show in the link preview
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

// Since Next.js requires metadata to be in a Server Component,
// we wrap your existing interactive page in this simple server file.
export default function ProductPageWrapper({ params }: { params: { id: string } }) {
  return <ProductClientPage id={params.id} />;
}