"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PRODUCT_CATEGORIES, STRAIN_TYPES } from "@/lib/product-constants"

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    category: "FLOWER",
    thcContent: "",
    cbdContent: "",
    strain: "",
    images: [] as string[],
    featured: false,
    ageRestricted: true,
    discountType: "",
    discountValue: 0,
    discountStartDate: "",
    discountEndDate: "",
  })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Remove % symbols from THC and CBD content
      const cleanedData = {
        ...formData,
        thcContent: formData.thcContent ? formData.thcContent.replace(/%/g, '').trim() : null,
        cbdContent: formData.cbdContent ? formData.cbdContent.replace(/%/g, '').trim() : null,
        images: formData.images.filter(img => img.trim() !== "")
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData)
      })

      if (response.ok) {
        router.push("/admin/products")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to create product")
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? parseFloat(value) : value
    }))
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    setFormData(prev => ({ ...prev, name, slug }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress("Uploading images...")
    setError("")

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadProgress(`Uploading image ${i + 1} of ${files.length}... (${file.name})`)

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          uploadedUrls.push(data.url)
          console.log('Uploaded:', data.url)
        } else {
          const errorData = await response.json()
          console.error('Upload error:', errorData)
          throw new Error(errorData.error || 'Upload failed')
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }))
      setUploadProgress(`Successfully uploaded ${uploadedUrls.length} image(s)!`)
      setTimeout(() => setUploadProgress(""), 2000)
    } catch (error: any) {
      console.error('Upload error:', error)
      setError(`Failed to upload images: ${error.message}`)
      setUploadProgress("")
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Add New Product</h1>
          <p className="text-gray-400">Create a new product in your catalog</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              placeholder="e.g., Lemon Haze"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Slug */}
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
              placeholder="lemon-haze"
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-gray-400 mt-1">Auto-generated from product name</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your product..."
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Price and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Price (R) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value.toUpperCase().replace('-', '_')}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* THC and CBD Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                THC Content
              </label>
              <input
                type="text"
                name="thcContent"
                value={formData.thcContent}
                onChange={handleChange}
                placeholder="e.g., 20%"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                CBD Content
              </label>
              <input
                type="text"
                name="cbdContent"
                value={formData.cbdContent}
                onChange={handleChange}
                placeholder="e.g., 1%"
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2">
                Strain Type
              </label>
              <select
                name="strain"
                value={formData.strain}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
              >
                <option value="">Select strain type...</option>
                {STRAIN_TYPES.map((strain) => (
                  <option key={strain.value} value={strain.value}>
                    {strain.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Product Images
            </label>
            
            {/* Upload Progress */}
            {uploadProgress && (
              <div className="mb-3 p-3 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-400 text-sm">
                {uploadProgress}
              </div>
            )}

            {/* Image Preview Grid */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File Upload Input */}
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-center transition-colors">
                  <span className="text-white font-medium">
                    {uploading ? "Uploading..." : "Choose Images"}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    Click to select product images
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              You can upload multiple images at once. First image will be the main product image.
            </p>
          </div>

          {/* Featured */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-5 h-5 rounded border-zinc-700 text-primary focus:ring-primary"
              />
              <span className="text-white font-medium">Feature this product on homepage</span>
            </label>
          </div>

          {/* Age Restricted */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="ageRestricted"
                checked={formData.ageRestricted}
                onChange={(e) => setFormData({ ...formData, ageRestricted: e.target.checked })}
                className="w-5 h-5 rounded border-zinc-700 text-orange-500 focus:ring-orange-500"
              />
              <div>
                <span className="text-white font-bold block">18+ Age Restricted Product</span>
                <span className="text-sm text-gray-400">
                  Requires age verification (cannabis, bongs, papers, etc.)
                </span>
              </div>
            </label>
          </div>

          {/* Discount Section */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Discount Settings (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Discount Type
                </label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">No Discount</option>
                  <option value="PERCENTAGE">Percentage Off (%)</option>
                  <option value="FIXED">Fixed Amount Off (R)</option>
                </select>
              </div>

              {/* Discount Value */}
              {formData.discountType && (
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    min="0"
                    max={formData.discountType === "PERCENTAGE" ? "100" : undefined}
                    step="0.01"
                    placeholder={formData.discountType === "PERCENTAGE" ? "e.g., 20" : "e.g., 50.00"}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {formData.discountType === "PERCENTAGE" 
                      ? "Percentage off (0-100)" 
                      : "Fixed amount in Rands"}
                  </p>
                </div>
              )}
            </div>

            {/* Discount Dates */}
            {formData.discountType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Start Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="discountStartDate"
                    value={formData.discountStartDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-gray-400 mt-1">When discount becomes active</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    name="discountEndDate"
                    value={formData.discountEndDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                  />
                  <p className="text-xs text-gray-400 mt-1">When discount expires</p>
                </div>
              </div>
            )}

            {/* Discount Preview */}
            {formData.discountType && formData.discountValue > 0 && formData.price > 0 && (
              <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Discount Preview:</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-white line-through">
                    R{formData.price.toFixed(2)}
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    R{(formData.discountType === "PERCENTAGE" 
                      ? formData.price * (1 - formData.discountValue / 100)
                      : formData.price - formData.discountValue
                    ).toFixed(2)}
                  </span>
                  <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-bold rounded-full">
                    {formData.discountType === "PERCENTAGE" 
                      ? `${formData.discountValue}% OFF`
                      : `R${formData.discountValue} OFF`}
                  </span>
                </div>
              </div>
            )}
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
              {loading ? "Creating..." : "Create Product"}
            </button>
            <Link
              href="/admin/products"
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
