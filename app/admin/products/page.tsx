"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Package, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  category: string
  images: string[]
  featured: boolean
  thcContent: string | null
  cbdContent: string | null
  strain: string | null
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; product: Product | null }>({
    show: false,
    product: null
  })
  const [deleting, setDeleting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const itemsPerPage = 10

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    loadProducts()
  }, [currentPage, debouncedSearch])

  const loadProducts = async () => {
    if (initialLoading) {
      setInitialLoading(true)
    } else {
      setSearchLoading(true)
    }
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearch,
      })
      const response = await fetch(`/api/admin/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products)
        setTotalPages(data.totalPages)
        setTotalProducts(data.total)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setInitialLoading(false)
      setSearchLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal.product) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/products/${deleteModal.product.id}`, {
        method: "DELETE"
      })

      if (response.ok) {
        setDeleteModal({ show: false, product: null })
        loadProducts()
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setDeleting(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Skeleton loader component
  const ProductRowSkeleton = () => (
    <tr className="border-b border-zinc-800">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-zinc-800 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="h-6 bg-zinc-800 rounded-full animate-pulse w-20" />
      </td>
      <td className="p-4">
        <div className="h-6 bg-zinc-800 rounded animate-pulse w-16" />
      </td>
      <td className="p-4">
        <div className="space-y-1">
          <div className="h-4 bg-zinc-800 rounded animate-pulse w-16" />
          <div className="h-4 bg-zinc-800 rounded animate-pulse w-16" />
        </div>
      </td>
      <td className="p-4">
        <div className="h-6 bg-zinc-800 rounded-full animate-pulse w-20" />
      </td>
      <td className="p-4">
        <div className="flex items-center justify-end gap-2">
          <div className="w-8 h-8 bg-zinc-800 rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-zinc-800 rounded-lg animate-pulse" />
        </div>
      </td>
    </tr>
  )

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/images/weed-icon.png" 
            alt="Loading"
            className="w-16 h-16 animate-spin"
          />
          <p className="text-white text-lg">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-gray-400">Manage your product catalog ({totalProducts} total)</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105 w-fit"
          style={{
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            color: '#000',
          }}
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name, category, or description..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-12 pr-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Products Table */}
      {searchLoading ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-sm font-bold text-gray-400 uppercase">Product</th>
                  <th className="text-left p-4 text-sm font-bold text-gray-400 uppercase">Category</th>
                  <th className="text-left p-4 text-sm font-bold text-gray-400 uppercase">Price</th>
                  <th className="text-left p-4 text-sm font-bold text-gray-400 uppercase">THC/CBD</th>
                  <th className="text-left p-4 text-sm font-bold text-gray-400 uppercase">Status</th>
                  <th className="text-right p-4 text-sm font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: itemsPerPage }).map((_, i) => (
                  <ProductRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No products yet</h3>
          <p className="text-gray-400 mb-6">Get started by adding your first product</p>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: '#000',
            }}
          >
            <Plus className="w-5 h-5" />
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left p-4 text-sm font-bold text-gray-400 uppercase">Product</th>
                  <th className="text-left p-4 text-sm font-bold text-gray-400 uppercase">Category</th>
                  <th className="text-left p-4 text-sm font-bold text-gray-400 uppercase">Price</th>
                  <th className="text-left p-4 text-sm font-bold text-gray-400 uppercase">THC/CBD</th>
                  <th className="text-left p-4 text-sm font-bold text-gray-400 uppercase">Status</th>
                  <th className="text-right p-4 text-sm font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    {/* Product Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                          {product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{product.name}</h3>
                          <p className="text-sm text-gray-400 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-gray-300">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="p-4">
                      <span className="text-lg font-bold text-primary">R{product.price.toFixed(2)}</span>
                    </td>

                    {/* THC/CBD */}
                    <td className="p-4">
                      <div className="text-sm text-gray-300">
                        {product.thcContent && <div>THC: {product.thcContent}%</div>}
                        {product.cbdContent && <div>CBD: {product.cbdContent}%</div>}
                        {!product.thcContent && !product.cbdContent && <span className="text-gray-500">-</span>}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {product.featured ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary">
                          Featured
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-gray-400">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 hover:bg-primary/20 text-gray-400 hover:text-primary rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ show: true, product })}
                          className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-zinc-800">
              <p className="text-sm text-gray-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-black'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-gray-500 px-1">...</span>
                    }
                    return null
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Delete Product?</h3>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                {deleteModal.product.images[0] && (
                  <img
                    src={deleteModal.product.images[0]}
                    alt={deleteModal.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-bold text-white">{deleteModal.product.name}</p>
                  <p className="text-sm text-gray-400">R{deleteModal.product.price.toFixed(2)}</p>
                </div>
              </div>
              
              <p className="text-gray-300">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, product: null })}
                disabled={deleting}
                className="flex-1 py-3 px-6 rounded-full font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 px-6 rounded-full font-bold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
