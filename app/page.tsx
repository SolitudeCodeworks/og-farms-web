import Link from "next/link"
import { Hero } from "@/components/home/hero"
import { ProductCard } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, Cookie, Droplet, Flame } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function getFeaturedProducts() {
  try {
    const session = await getServerSession(authOptions)
    
    // Admin users bypass age restrictions
    const isAdmin = session?.user?.role === 'ADMIN'
    
    // Check if user is logged in and 18+
    let isOver18 = isAdmin
    
    if (!isAdmin && session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { 
          dateOfBirth: true
        }
      })
      
      if (user?.dateOfBirth) {
        // Calculate age from date of birth
        const birthDate = new Date(user.dateOfBirth)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }
        isOver18 = age >= 18
      }
    }

    const products = await prisma.product.findMany({
      where: { 
        featured: true,
        // Only get non-18+ products if not verified
        ageRestricted: isOver18 ? undefined : false
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: {
        storeInventory: {
          select: {
            quantity: true,
          }
        }
      }
    })

    return products.map(product => {
      const totalStock = product.storeInventory.reduce((sum: number, inv: { quantity: number }) => sum + inv.quantity, 0)
      
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice ?? undefined,
        image: product.images[0] || "/products/placeholder.svg",
        category: product.category,
        thcContent: product.thcContent ? parseFloat(product.thcContent) : undefined,
        cbdContent: product.cbdContent ? parseFloat(product.cbdContent) : undefined,
        stock: totalStock,
        ageRestricted: product.ageRestricted,
      }
    })
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts()
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
            <Link href="/products?category=FLOWER">
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
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all group-hover:scale-110" 
                       style={{ 
                         backgroundColor: 'rgba(74, 222, 128, 0.1)',
                         borderColor: 'rgba(74, 222, 128, 0.4)',
                         border: '2px solid'
                       }}>
                    <Leaf className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Flower</h3>
                  <p className="text-gray-400">Premium buds & strains</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            {/* Category 2 - Edibles */}
            <Link href="/products?category=EDIBLES">
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
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all group-hover:scale-110" 
                       style={{ 
                         backgroundColor: 'rgba(74, 222, 128, 0.1)',
                         borderColor: 'rgba(74, 222, 128, 0.4)',
                         border: '2px solid'
                       }}>
                    <Cookie className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Edibles</h3>
                  <p className="text-gray-400">Tasty treats & snacks</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            {/* Category 3 - Concentrates */}
            <Link href="/products?category=CONCENTRATES">
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
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all group-hover:scale-110" 
                       style={{ 
                         backgroundColor: 'rgba(74, 222, 128, 0.1)',
                         borderColor: 'rgba(74, 222, 128, 0.4)',
                         border: '2px solid'
                       }}>
                    <Droplet className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Concentrates</h3>
                  <p className="text-gray-400">Wax, shatter & more</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            {/* Category 4 - Accessories */}
            <Link href="/products?category=ACCESSORIES">
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
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all group-hover:scale-110" 
                       style={{ 
                         backgroundColor: 'rgba(74, 222, 128, 0.1)',
                         borderColor: 'rgba(74, 222, 128, 0.4)',
                         border: '2px solid'
                       }}>
                    <Flame className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Accessories</h3>
                  <p className="text-gray-400">Bongs, papers & tools</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose OG Farms */}
      <section className="py-16 md:py-24 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="text-green-400">OG Farms</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Quality, trust, and community - that's what we stand for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-400/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Premium Quality</h3>
              <p className="text-gray-400">
                Every product is carefully grown, tested, and curated for the best experience
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-400/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Fair Pricing</h3>
              <p className="text-gray-400">
                Transparent pricing with no hidden fees. Quality cannabis at honest prices
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center" data-aos="fade-up" data-aos-delay="300">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-400/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Community First</h3>
              <p className="text-gray-400">
                Built by the community, for the community. We listen and adapt to your needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Promise Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-zinc-900 to-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              The <span className="text-green-400">OG Farms</span> Difference
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              What sets us apart in the South African cannabis scene
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center hover:border-green-400/50 transition-all" data-aos="fade-up" data-aos-delay="100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-400/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Locally Grown</h3>
              <p className="text-gray-400 text-sm">
                Proudly South African, supporting local growers and communities
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center hover:border-green-400/50 transition-all" data-aos="fade-up" data-aos-delay="200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-400/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Lab Tested</h3>
              <p className="text-gray-400 text-sm">
                Every batch tested for quality, safety, and consistency
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center hover:border-green-400/50 transition-all" data-aos="fade-up" data-aos-delay="300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-400/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Wide Selection</h3>
              <p className="text-gray-400 text-sm">
                From flower to edibles, find exactly what you're looking for
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-center hover:border-green-400/50 transition-all" data-aos="fade-up" data-aos-delay="400">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-400/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Customer Care</h3>
              <p className="text-gray-400 text-sm">
                Dedicated support and guidance for all your cannabis needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-zinc-900 to-black">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Experience <span className="text-green-400">Premium Cannabis</span>?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied customers and discover why OG Farms is South Africa's trusted cannabis brand
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <button 
                className="px-8 py-4 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105 text-lg"
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: '#000',
                  boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)',
                }}
              >
                Shop Now
              </button>
            </Link>
            <Link href="/about">
              <button 
                className="px-8 py-4 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105 text-lg border-2 border-green-400 text-green-400 hover:bg-green-400/10"
              >
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
