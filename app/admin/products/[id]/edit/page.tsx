"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { PRODUCT_CATEGORIES, STRAIN_TYPES, SUBCATEGORIES } from "@/lib/product-constants"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState("")
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    category: "FLOWER",
    subcategory: "",
    thcContent: "",
    cbdContent: "",
    strain: "",
    images: [] as string[],
    featured: false,
    ageRestricted: true,
    discountType: "",
    discountValue: "",
    discountStartDate: "",
    discountEndDate: "",
  })

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (response.ok) {
        const data = await response.json()
        setFormData({
          name: data.product.name,
          slug: data.product.slug,
          description: data.product.description,
          price: data.product.price,
          category: data.product.category,
          subcategory: data.product.subcategory || "",
          thcContent: data.product.thcContent || "",
          cbdContent: data.product.cbdContent || "",
          strain: data.product.strain || "",
          images: data.product.images || [],
          featured: data.product.featured,
          ageRestricted: data.product.ageRestricted,
          discountType: data.product.discountType || "",
          discountValue: data.product.discountValue?.toString() || "",
          discountStartDate: data.product.discountStartDate ? new Date(data.product.discountStartDate).toISOString().split('T')[0] : "",
          discountEndDate: data.product.discountEndDate ? new Date(data.product.discountEndDate).toISOString().split('T')[0] : "",
        })
      }
    } catch (error) {
      console.error("Error loading product:", error)
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const cleanedData = {
        ...formData,
        thcContent: formData.thcContent ? formData.thcContent.replace(/%/g, '').trim() : null,
        cbdContent: formData.cbdContent ? formData.cbdContent.replace(/%/g, '').trim() : null,
        images: formData.images.filter(img => img.trim() !== "")
      }

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData)
      })

      if (response.ok) {
        router.push("/admin/products")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update product")
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
        } else {
          const errorData = await response.json()
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

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/images/weed-icon.png" 
            alt="Loading"
            className="w-16 h-16 animate-spin"
          />
          <p className="text-white text-lg">Loading product...</p>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-white mb-2">Edit Product</h1>
          <p className="text-gray-400">Update product information</p>
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
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            />
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
                  <option key={cat.value} value={cat.value.toUpperCase()}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* THC/CBD/Strain/Subcategory - Only for Flower, Edibles, and Pre-Rolls */}
          {(formData.category === 'FLOWER' || formData.category === 'EDIBLES' || formData.category === 'PRE_ROLLS') && (
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
                  placeholder="e.g., 20"
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
                  placeholder="e.g., 1"
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
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Subcategory (Growing Method)
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select subcategory...</option>
                  {SUBCATEGORIES.map((sub) => (
                    <option key={sub.value} value={sub.value}>
                      {sub.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Product Images */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              Product Images
            </label>
            
            {uploadProgress && (
              <div className="mb-3 p-3 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-400 text-sm">
                {uploadProgress}
              </div>
            )}

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
                      className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer">
                <div className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-center transition-colors">
                  <span className="text-white font-medium">
                    {uploading ? "Uploading..." : "Add More Images"}
                  </span>
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

          {/* Discount Section */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">💰 Discount Settings (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

              {formData.discountType && (
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    {formData.discountType === 'PERCENTAGE' ? 'Percentage (%)' : 'Amount (R)'}
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleChange}
                    min="0"
                    max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                    step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                    placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g., 20' : 'e.g., 50.00'}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>

            {formData.discountType && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="discountStartDate"
                    value={formData.discountStartDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="discountEndDate"
                    value={formData.discountEndDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Age Restricted */}
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="ageRestricted"
                checked={formData.ageRestricted}
                onChange={handleChange}
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
              {loading ? "Updating..." : "Update Product"}
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
