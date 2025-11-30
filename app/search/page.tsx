"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, X, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // Debounced search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      setProducts([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Error searching products:', error)
      } finally {
        setLoading(false)
      }
    }, 300) // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Search Products</h1>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, strains, categories..."
              className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors text-lg"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-white text-lg">Searching...</p>
            </div>
          </div>
        ) : searchQuery.trim() ? (
          products.length > 0 ? (
            <>
              <p className="text-gray-400 mb-6">
                Found {products.length} {products.length === 1 ? 'product' : 'products'} for "{searchQuery}"
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <div className="aspect-square relative overflow-hidden bg-zinc-800">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🌿
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-primary font-semibold mb-1 uppercase">
                        {product.category}
                      </p>
                      <h3 className="text-white font-bold mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-bold text-primary">
                        R{product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
              <p className="text-gray-400 mb-6">
                We couldn't find any products matching "{searchQuery}"
              </p>
              <Button
                onClick={() => setSearchQuery("")}
                className="bg-primary hover:bg-primary/90 text-black font-bold"
              >
                Clear Search
              </Button>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-2">Start searching</h3>
            <p className="text-gray-400">
              Enter a product name, strain, or category to search
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
