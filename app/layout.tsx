import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AOSProvider } from "@/components/providers/aos-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { CartProvider } from "@/contexts/cart-context";
import { Analytics } from "@vercel/analytics/react";

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
  title: "OG Farms - Premium Medical Cannabis Products | 18+ Only",
  description: "Premium medical cannabis products for adults 18+. High quality THC, CBD, flower, and accessories with fast, discreet delivery. Legal medical cannabis dispensary.",
  keywords: ["medical cannabis", "medical marijuana", "THC", "CBD", "cannabis flower", "18+", "legal cannabis", "cannabis dispensary", "medical weed", "cannabis accessories", "bongs", "grinders"],
  openGraph: {
    title: "OG Farms - Premium Medical Cannabis Products | 18+ Only",
    description: "Premium medical cannabis products for adults 18+. High quality THC, CBD, flower, and accessories with fast, discreet delivery.",
    type: "website",
    locale: "en_ZA",
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "age-restriction": "18+",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "OG Farms",
    "description": "Premium medical cannabis products for adults 18+. Legal medical cannabis dispensary.",
    "url": "https://ogfarms.co.za",
    "logo": "https://ogfarms.co.za/images/weed-icon.png",
    "image": "https://ogfarms.co.za/images/weed-icon.png",
    "telephone": "073-963-8575",
    "priceRange": "R50 - R5000",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "ZA"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Medical Cannabis Products",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Medical Cannabis Flower"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Cannabis Accessories"
          }
        }
      ]
    }
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <meta name="age-gate" content="18+" />
        <meta name="rating" content="adult" />
      </head>
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
        <Analytics />
      </body>
    </html>
  );
}
