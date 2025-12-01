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
    </>
  )
}
