"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  thcContent: string | null
  cbdContent: string | null
  strain: string | null
  images: string[]
  featured: boolean
  ageRestricted: boolean
}

export default function FavouritesPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavourites()
  }, [session])

  const loadFavourites = async () => {
    setLoading(true)

    try {
      if (session) {
        // Load from database for logged-in users
        const response = await fetch('/api/wishlist')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.wishlistItems?.map((item: any) => item.product) || [])
        }
      } else {
        // Load from localStorage for guests
        const favoriteIds = JSON.parse(localStorage.getItem('guestFavorites') || '[]')
        
        if (favoriteIds.length > 0) {
          // Fetch product details for favorite IDs
          const response = await fetch('/api/products')
          if (response.ok) {
            const data = await response.json()
            const favoriteProducts = data.products.filter((p: Product) => 
              favoriteIds.includes(p.id)
            )
            setProducts(favoriteProducts)
          }
        }
      }
    } catch (error) {
      console.error("Error loading favourites:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavourite = async (productId: string) => {
    try {
      if (session) {
        // Remove from database
        const response = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        })

        if (response.ok) {
          setProducts(products.filter(p => p.id !== productId))
        }
      } else {
        // Remove from localStorage
        const favorites = JSON.parse(localStorage.getItem('guestFavorites') || '[]')
        const updated = favorites.filter((id: string) => id !== productId)
        localStorage.setItem('guestFavorites', JSON.stringify(updated))
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error("Error removing favourite:", error)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      >
        <source src="/weed_loop.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-bebas)]">
            MY FAVOURITES
          </h1>
          <p className="text-gray-400 text-lg">
            {session ? 'Your saved products' : 'Your saved products (sign in to sync across devices)'}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-zinc-800" />
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-zinc-800 rounded w-3/4" />
                  <div className="h-4 bg-zinc-800 rounded w-full" />
                  <div className="h-8 bg-zinc-800 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-800 rounded-full mb-6">
              <Heart className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No favourites yet</h3>
            <p className="text-gray-400 text-lg mb-6">
              Start adding products to your favourites by clicking the heart icon
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 font-bold rounded-full transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#000',
              }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden hover:border-primary transition-all"
              >
                {/* Product Image */}
                <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-zinc-800">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      No Image
                    </div>
                  )}
                  {product.featured && (
                    <span className="absolute top-3 right-3 px-3 py-1 text-xs font-bold rounded-full shadow-lg animate-pulse"
                      style={{
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        color: '#000',
                        boxShadow: '0 4px 15px rgba(74, 222, 128, 0.5)',
                      }}
                    >
                      ⭐ Featured
                    </span>
                  )}
                  {product.ageRestricted && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                      18+
                    </span>
                  )}
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* THC/CBD/Strain */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {product.thcContent && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                        THC: {product.thcContent}%
                      </span>
                    )}
                    {product.cbdContent && (
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                        CBD: {product.cbdContent}%
                      </span>
                    )}
                    {product.strain && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded capitalize">
                        {product.strain}
                      </span>
                    )}
                  </div>

                  {/* Price and Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      R{product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFavourite(product.id)}
                      className="p-2 bg-zinc-800 hover:bg-red-500/20 rounded-full transition-all group/btn"
                      title="Remove from favourites"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
