import type { Metadata } from "next";
import { Montserrat, Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["400", "700"],
});

// ==========================================
// GLOBAL SEO & SOCIAL SHARING METADATA
// ==========================================
export const metadata: Metadata = {
  // IMPORTANT: Change this to your real domain when you launch (e.g., https://leelagos.com)
  metadataBase: new URL('https://leelagos.com'), 
  title: {
    default: 'LEE LAGOS | The Standard.',
    template: '%s | LEE LAGOS'
  },
  description: 'Discover the finest collection of luxury watches, moissanite, diamonds, and signature perfumes. The standard of luxury in Lagos.',
  openGraph: {
    title: 'LEE LAGOS | The Standard.',
    description: 'Discover the finest collection of luxury pieces. The standard of luxury in Lagos.',
    url: '/',
    siteName: 'Lee Lagos',
    images: [
      {
        url: '/og-image.jpg', // Remember to add this image to your public folder!
        width: 1200,
        height: 630,
        alt: 'Lee Lagos Luxury Collection',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LEE LAGOS | The Standard.',
    description: 'The standard of luxury in Lagos.',
    images: ['/og-image.jpg'], // Uses the same image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${lato.variable} antialiased`}>
        
        {/* WRAP THE APP IN THE CART PROVIDER */}
        <CartProvider>
          <main className="min-h-screen pt-4">
            {children}
          </main>
        </CartProvider>
        
      </body>
    </html>
  );
}