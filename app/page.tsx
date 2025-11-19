import Link from "next/link"
import { Hero } from "@/components/home/hero"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

// This will be replaced with actual database queries
const featuredProducts = [
  {
    id: "1",
    name: "Granddaddy Purple",
    slug: "granddaddy-purple",
    price: 21,
    compareAtPrice: 25,
    image: "/products/placeholder-1.jpg",
    category: "FLOWER",
    thcContent: 23,
    stock: 10,
  },
  {
    id: "2",
    name: "Girl Scout Cookies",
    slug: "girl-scout-cookies",
    price: 14,
    compareAtPrice: 18,
    image: "/products/placeholder-2.jpg",
    category: "FLOWER",
    thcContent: 28,
    cbdContent: 1,
    stock: 15,
  },
  {
    id: "3",
    name: "Sour Diesel",
    slug: "sour-diesel",
    price: 11,
    image: "/products/placeholder-3.jpg",
    category: "FLOWER",
    thcContent: 22,
    stock: 8,
  },
  {
    id: "4",
    name: "Premium Glass Bong",
    slug: "premium-glass-bong",
    price: 89,
    compareAtPrice: 120,
    image: "/products/placeholder-4.jpg",
    category: "BONGS",
    stock: 5,
  },
]

export default function Home() {
  return (
    <>
      <Hero />

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Featured Products
              </h2>
              <p className="mt-2 text-muted-foreground">
                Choose your favorite strains. Prices will be calculated upon checkout.
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link href="/shop">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="mt-8 flex justify-center md:hidden">
            <Button variant="outline" asChild>
              <Link href="/shop">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Why Choose OG Farms?
              </h2>
              <p className="text-muted-foreground mb-6">
                We&apos;re committed to providing the highest quality cannabis products with exceptional customer service. Our products are sourced from trusted growers and tested for purity and potency.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-foreground">Lab Tested</h3>
                    <p className="text-sm text-muted-foreground">All products tested for quality and safety</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-foreground">Fast Shipping</h3>
                    <p className="text-sm text-muted-foreground">2-day delivery across the United States</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-primary mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-foreground">Secure & Discreet</h3>
                    <p className="text-sm text-muted-foreground">Privacy guaranteed with unmarked packaging</p>
                  </div>
                </li>
              </ul>
              <Button size="lg" asChild className="mt-8">
                <Link href="/about">Learn More About Us</Link>
              </Button>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-lg overflow-hidden bg-muted">
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                [Product Image Placeholder]
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
