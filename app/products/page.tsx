"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Filter, X, ChevronDown, ShoppingCart } from "lucide-react"
import { PRODUCT_CATEGORIES, STRAIN_TYPES, PRICE_RANGES, SORT_OPTIONS } from "@/lib/product-constants"

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  category: string
  subcategory?: string | null
  thcContent: string | null
  cbdContent: string | null
  strain: string | null
  images: string[]
  featured: boolean
  ageRestricted: boolean
  stockQuantity?: number
}

const ITEMS_PER_PAGE = 12

// Skeleton Loader Component
const ProductSkeleton = () => (
  <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-zinc-800" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-zinc-800 rounded w-3/4" />
      <div className="h-4 bg-zinc-800 rounded w-full" />
      <div className="h-4 bg-zinc-800 rounded w-2/3" />
      <div className="flex gap-2">
        <div className="h-6 bg-zinc-800 rounded w-16" />
        <div className="h-6 bg-zinc-800 rounded w-16" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-8 bg-zinc-800 rounded w-24" />
        <div className="h-4 bg-zinc-800 rounded w-20" />
      </div>
    </div>
  </div>
)

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedStrain, setSelectedStrain] = useState("")
  const [selectedPriceRange, setSelectedPriceRange] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  
  const observerTarget = useRef<HTMLDivElement>(null)

  // Read URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const categoryParam = params.get('category')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchTerm, selectedCategory, selectedStrain, selectedPriceRange, sortBy])

  useEffect(() => {
    // Intersection Observer for infinite scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreProducts()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingMore, displayedProducts])

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.strain && product.strain.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Strain filter
    if (selectedStrain) {
      filtered = filtered.filter(product => 
        product.strain?.toLowerCase() === selectedStrain.toLowerCase()
      )
    }

    // Price range filter
    if (selectedPriceRange) {
      const range = PRICE_RANGES.find(r => r.value === selectedPriceRange)
      if (range) {
        filtered = filtered.filter(product => 
          product.price >= range.min && product.price < range.max
        )
      }
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "newest":
      default:
        // Assuming products come newest first from API
        break
    }

    // Reset pagination
    setPage(1)
    setDisplayedProducts(filtered.slice(0, ITEMS_PER_PAGE))
    setHasMore(filtered.length > ITEMS_PER_PAGE)
  }

  const loadMoreProducts = useCallback(() => {
    setLoadingMore(true)
    
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const nextPage = page + 1
      const startIndex = page * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      
      let filtered = [...products]
      
      // Apply same filters
      if (searchTerm) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.strain && product.strain.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }
      if (selectedCategory) {
        filtered = filtered.filter(product => 
          product.category.toLowerCase() === selectedCategory.toLowerCase()
        )
      }
      if (selectedStrain) {
        filtered = filtered.filter(product => 
          product.strain?.toLowerCase() === selectedStrain.toLowerCase()
        )
      }
      if (selectedPriceRange) {
        const range = PRICE_RANGES.find(r => r.value === selectedPriceRange)
        if (range) {
          filtered = filtered.filter(product => 
            product.price >= range.min && product.price < range.max
          )
        }
      }
      
      const newProducts = filtered.slice(startIndex, endIndex)
      setDisplayedProducts(prev => [...prev, ...newProducts])
      setPage(nextPage)
      setHasMore(endIndex < filtered.length)
      setLoadingMore(false)
    })
  }, [page, products, searchTerm, selectedCategory, selectedStrain, selectedPriceRange])

  const addToCart = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setAddingToCart(product.id)
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Trigger cart update event
        window.dispatchEvent(new Event('cartUpdated'))
        
        // Show success toast
        setToast({ message: `${product.name} added to stash!`, type: 'success' })
        setTimeout(() => setToast(null), 3000)
      } else {
        // Show error toast
        setToast({ message: data.error || 'Failed to add to cart', type: 'error' })
        setTimeout(() => setToast(null), 4000)
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' })
      setTimeout(() => setToast(null), 4000)
    } finally {
      setAddingToCart(null)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("")
    setSelectedStrain("")
    setSelectedPriceRange("")
    setSortBy("newest")
  }

  const activeFiltersCount = [
    searchTerm,
    selectedCategory,
    selectedStrain,
    selectedPriceRange,
  ].filter(Boolean).length

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
            SHOP PRODUCTS
          </h1>
          <p className="text-gray-400 text-lg">
            Browse our selection of premium cannabis products
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-primary text-black text-xs font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">All Categories</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Strain Filter */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Strain Type</label>
                <select
                  value={selectedStrain}
                  onChange={(e) => setSelectedStrain(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">All Strains</option>
                  {STRAIN_TYPES.map((strain) => (
                    <option key={strain.value} value={strain.value}>
                      {strain.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">Price Range</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">All Prices</option>
                  {PRICE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="md:col-span-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-white font-bold">{displayedProducts.length}</span> of{" "}
            <span className="text-white font-bold">{products.length}</span> products
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <p className="text-2xl font-semibold text-white">No products found</p>
              <p className="text-gray-400">Try adjusting your filters to see more results</p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-2 flex items-center gap-2 px-8 py-3 bg-[#9EFF00] hover:bg-[#8EEF00] text-black font-bold rounded-lg transition-all hover:scale-105 shadow-lg shadow-[#9EFF00]/30"
                >
                  <X className="w-5 h-5" />
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden hover:border-primary transition-all hover:scale-105"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-zinc-800">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
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
                    {product.stockQuantity === 0 && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
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

                    {/* Price and Category */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-primary">
                        R{product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400 capitalize">
                        {product.category.toLowerCase().replace('-', ' ')}
                      </span>
                    </div>

                    {/* Add to Stash Button */}
                    <button
                      onClick={(e) => addToCart(product, e)}
                      disabled={addingToCart === product.id || product.stockQuantity === 0}
                      className="w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        background: (addingToCart === product.id || product.stockQuantity === 0) ? '#666' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        color: '#000',
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {product.stockQuantity === 0 ? 'Out of Stock' : addingToCart === product.id ? 'Adding...' : 'Add to Stash'}
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <ProductSkeleton key={`loading-${index}`} />
                ))}
              </div>
            )}
            
            <div ref={observerTarget} className="mt-8 flex justify-center">
              {!hasMore && displayedProducts.length > 0 && !loadingMore && (
                <p className="text-gray-400">You've reached the end</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5">
          <div 
            className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] ${
              toast.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <p className="text-white font-semibold">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
