"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"

interface Store {
  id: string
  name: string
  city: string
}

interface Product {
  id: string
  name: string
  images: string[]
}

export default function AddStockPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [stores, setStores] = useState<Store[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    storeId: "",
    productId: "",
    quantity: 0,
    lowStockAlert: 10,
  })

  useEffect(() => {
    loadStoresAndProducts()
  }, [])

  const loadStoresAndProducts = async () => {
    try {
      const [storesRes, productsRes] = await Promise.all([
        fetch("/api/admin/stores"),
        fetch("/api/products")
      ])

      if (storesRes.ok) {
        const storesData = await storesRes.json()
        setStores(storesData.stores || [])
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      }
    } catch (error) {
      console.error("Error loading data:", error)
      setError("Failed to load stores and products")
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log('Form submitted with data:', formData)

    if (!formData.storeId || !formData.productId) {
      setError("Please select both a store and a product")
      setLoading(false)
      return
    }

    if (formData.quantity <= 0) {
      setError("Quantity must be greater than 0")
      setLoading(false)
      return
    }

    try {
      console.log('Sending request to /api/admin/inventory')
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Success:', data)
        router.push("/admin/inventory")
      } else {
        const data = await response.json()
        console.error('Error response:', data)
        setError(data.error || "Failed to add stock")
      }
    } catch (error) {
      console.error('Request failed:', error)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" || name === "lowStockAlert" ? parseInt(value) : value
    }))
  }

  const selectedProduct = products.find(p => p.id === formData.productId)

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/images/weed-icon.png" 
            alt="Loading"
            className="w-16 h-16 animate-spin"
          />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/inventory"
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Add Stock</h1>
          <p className="text-gray-400">Add products to store inventory</p>
        </div>
      </div>

      {/* Missing Data Warnings */}
      {(stores.length === 0 || products.length === 0) && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-orange-400 mb-2">Setup Required</h3>
          <div className="space-y-2 text-gray-300">
            {stores.length === 0 && (
              <p>• You need to <Link href="/admin/stores/new" className="text-primary hover:underline">create a store</Link> first</p>
            )}
            {products.length === 0 && (
              <p>• You need to <Link href="/admin/products/new" className="text-primary hover:underline">create products</Link> first</p>
            )}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Select Store */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Select Store *
            </label>
            <select
              name="storeId"
              value={formData.storeId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            >
              <option value="">Choose a store...</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} - {store.city}
                </option>
              ))}
            </select>
          </div>

          {/* Select Product */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Select Product *
            </label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            >
              <option value="">Choose a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Preview */}
          {selectedProduct && (
            <div className="p-4 bg-zinc-800 rounded-lg flex items-center gap-4">
              {selectedProduct.images[0] && (
                <img
                  src={selectedProduct.images[0]}
                  alt={selectedProduct.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="text-white font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-400">Selected product</p>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              placeholder="Enter quantity"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-gray-400 mt-1">Number of units to add</p>
          </div>

          {/* Low Stock Alert */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Low Stock Alert Threshold
            </label>
            <input
              type="number"
              name="lowStockAlert"
              value={formData.lowStockAlert}
              onChange={handleChange}
              min="0"
              placeholder="10"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-gray-400 mt-1">Alert when stock falls below this number</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-6 rounded-full font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading ? '#666' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#000',
              }}
            >
              {loading ? "Adding..." : "Add Stock"}
            </button>
            <Link
              href="/admin/inventory"
              className="flex-1 py-3 px-6 rounded-full font-bold text-center bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
