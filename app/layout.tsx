import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AOSProvider } from "@/components/providers/aos-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { CartProvider } from "@/contexts/cart-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OG Farms - Premium Cannabis Products",
  description: "High quality medical and recreational cannabis with fast and discreet delivery. Shop THC, CBD, bongs, grinders, papers and more.",
  keywords: ["cannabis", "THC", "CBD", "marijuana", "weed", "bongs", "grinders", "accessories"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebas.variable} ${inter.variable} antialiased`}
      >
        <SessionProvider>
          <CartProvider>
            <AOSProvider>
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
            </AOSProvider>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
