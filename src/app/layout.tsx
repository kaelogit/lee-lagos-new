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
    default: "LEE'S JEWELLERS | The Standard.",
    template: "%s | LEE'S JEWELLERS"
  },
  description: "Discover the finest collection of luxury watches, moissanite, diamonds, and signature perfumes at Lee's Jewellers. The standard of luxury in Lagos.",
  openGraph: {
    title: "LEE'S JEWELLERS | The Standard.",
    description: "Discover the finest collection of luxury pieces at Lee's Jewellers. The standard of luxury in Lagos.",
    url: '/',
    siteName: "Lee's Jewellers",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "Lee's Jewellers Luxury Collection",
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "LEE'S JEWELLERS | The Standard.",
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