"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Store } from "lucide-react"

export default function NewStorePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    allowsPickup: true,
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push("/admin/stores")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create store")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setFormData(prev => ({ ...prev, name, slug }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/stores"
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Add New Store</h1>
          <p className="text-gray-400">Create a new store location</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Store Name */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Store Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              placeholder="e.g., OG Farms - Cape Town"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Slug (auto-generated) */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              required
              placeholder="og-farms-cape-town"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-gray-400 mt-1">Auto-generated from store name</p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Street Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="123 Main Street"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* City, State, Zip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Cape Town"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Province *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                placeholder="Western Cape"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Postal Code *
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                placeholder="8001"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+27 21 123 4567"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="capetown@ogfarms.co.za"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="allowsPickup"
                checked={formData.allowsPickup}
                onChange={handleChange}
                className="w-5 h-5 rounded border-zinc-700 text-primary focus:ring-primary"
              />
              <span className="text-white font-medium">Allow in-store pickup</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-5 h-5 rounded border-zinc-700 text-primary focus:ring-primary"
              />
              <span className="text-white font-medium">Store is active</span>
            </label>
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
              {loading ? "Creating..." : "Create Store"}
            </button>
            <Link
              href="/admin/stores"
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
