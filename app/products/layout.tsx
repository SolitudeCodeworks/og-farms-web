import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop Medical Cannabis Products | OG Farms - 18+ Only",
  description: "Browse our premium selection of medical cannabis flower, THC products, CBD products, and accessories. Legal medical cannabis for adults 18+. Fast, discreet delivery.",
  keywords: ["medical cannabis products", "buy medical cannabis", "THC flower", "CBD products", "cannabis accessories", "18+", "legal cannabis shop"],
  openGraph: {
    title: "Shop Medical Cannabis Products | OG Farms - 18+ Only",
    description: "Browse our premium selection of medical cannabis flower, THC products, CBD products, and accessories.",
    type: "website",
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
