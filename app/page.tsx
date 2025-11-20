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
    image: "/products/placeholder.svg",
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
    image: "/products/placeholder.svg",
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
    image: "/products/placeholder.svg",
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
    image: "/products/placeholder.svg",
    category: "BONGS",
    stock: 5,
  },
]

export default function Home() {
  return (
    <>
      <Hero />

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-4" data-aos="fade-up">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Featured Products
              </h2>
              <p className="mt-3 text-lg text-gray-400">
                Choose your favorite strains. Prices will be calculated upon checkout.
              </p>
            </div>
            <Link href="/shop" className="inline-block">
              <button 
                className="px-6 py-3 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: '#000',
                  boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)',
                }}
              >
                View All →
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Shop By Category
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Find exactly what you need, from flower to accessories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category 1 - Flower */}
            <Link href="/shop?category=flower">
              <div 
                className="group relative p-8 rounded-2xl backdrop-blur-sm border transition-all hover:scale-105 cursor-pointer overflow-hidden"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(74, 222, 128, 0.3)',
                  minHeight: '200px'
                }}
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <div className="relative z-10">
                  <div className="text-5xl mb-4">🌿</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Flower</h3>
                  <p className="text-gray-400">Premium buds & strains</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            {/* Category 2 - Edibles */}
            <Link href="/shop?category=edibles">
              <div 
                className="group relative p-8 rounded-2xl backdrop-blur-sm border transition-all hover:scale-105 cursor-pointer overflow-hidden"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(74, 222, 128, 0.3)',
                  minHeight: '200px'
                }}
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div className="relative z-10">
                  <div className="text-5xl mb-4">🍪</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Edibles</h3>
                  <p className="text-gray-400">Tasty treats & snacks</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            {/* Category 3 - Concentrates */}
            <Link href="/shop?category=concentrates">
              <div 
                className="group relative p-8 rounded-2xl backdrop-blur-sm border transition-all hover:scale-105 cursor-pointer overflow-hidden"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(74, 222, 128, 0.3)',
                  minHeight: '200px'
                }}
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <div className="relative z-10">
                  <div className="text-5xl mb-4">💎</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Concentrates</h3>
                  <p className="text-gray-400">Wax, shatter & more</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            {/* Category 4 - Accessories */}
            <Link href="/shop?category=accessories">
              <div 
                className="group relative p-8 rounded-2xl backdrop-blur-sm border transition-all hover:scale-105 cursor-pointer overflow-hidden"
                style={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  borderColor: 'rgba(74, 222, 128, 0.3)',
                  minHeight: '200px'
                }}
                data-aos="fade-up"
                data-aos-delay="400"
              >
                <div className="relative z-10">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Accessories</h3>
                  <p className="text-gray-400">Bongs, papers & tools</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
