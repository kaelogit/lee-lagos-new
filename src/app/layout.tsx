import type { Metadata } from "next";
import { Montserrat, Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import SmoothScroll from "../components/SmoothScroll";

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
  metadataBase: new URL('https://leesjewellers.com'),
  title: {
    default: "LEES JEWELLERS | The Standard.",
    template: "%s | LEES JEWELLERS"
  },
  description: "Discover the finest collection of luxury watches, moissanite, diamonds, and signature perfumes at Lees Jewellers. The standard of luxury in Lagos.",
  openGraph: {
    title: "LEES JEWELLERS | The Standard.",
    description: "Discover the finest collection of luxury pieces at Lees Jewellers. The standard of luxury in Lagos.",
    url: '/',
    siteName: "Lees Jewellers",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "Lees Jewellers Luxury Collection",
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "LEES JEWELLERS | The Standard.",
    description: "The standard of luxury in Lagos.",
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
        <SmoothScroll />
        <CartProvider>
          <main className="pt-4">
            {children}
          </main>
        </CartProvider>
        
      </body>
    </html>
  );
}