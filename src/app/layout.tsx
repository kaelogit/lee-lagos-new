import type { Metadata } from "next";
import { Montserrat, Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext"; // <--- 1. IMPORT CART PROVIDER

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

export const metadata: Metadata = {
  title: "Lee Lagos | Luxury Watches, Diamonds & Eyewear",
  description: "The official home of Lee Lagos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${lato.variable} antialiased`}>
        
        {/* 2. WRAP THE APP IN THE CART PROVIDER */}
        <CartProvider>
          <main className="min-h-screen pt-4">
            {children}
          </main>
        </CartProvider>
        
      </body>
    </html>
  );
}