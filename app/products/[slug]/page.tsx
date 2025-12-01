"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Star, StarHalf, ShoppingCart, Heart, ArrowLeft, Send, Trash2 } from "lucide-react"

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
  averageRating: number
  totalReviews: number
  discountType: string | null
  discountValue: number | null
  discountStartDate: string | null
  discountEndDate: string | null
}

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string
  verified: boolean
  helpful: number
  createdAt: string
  user: {
    name: string
    email?: string
  }
}

// Star Rating Component
const StarRating = ({ rating, size = "w-5 h-5" }: { rating: number; size?: string }) => {
  const roundedRating = Math.round(rating * 2) / 2 // Round to nearest 0.5
  const stars = []

  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      // Full star - filled with yellow
      stars.push(
        <Star key={i} className={`${size} fill-yellow-400 text-yellow-400`} />
      )
    } else if (i - 0.5 === roundedRating) {
      // Half star
      stars.push(
        <div key={i} className="relative">
          <Star className={`${size} fill-gray-600 text-gray-600`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${size} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      )
    } else {
      // Empty star - gray filled
      stars.push(
        <Star key={i} className={`${size} fill-gray-600 text-gray-600`} />
      )
    }
  }

  return <div className="flex items-center gap-1">{stars}</div>
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const slug = params.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [togglingFavorite, setTogglingFavorite] = useState(false)
  const [stockInfo, setStockInfo] = useState<{ totalStock: number; inStock: boolean } | null>(null)
  const [loadingStock, setLoadingStock] = useState(true)
  const [showAddedToast, setShowAddedToast] = useState(false)
  
  // Age restriction modal
  const [showAgeModal, setShowAgeModal] = useState(false)
  const [ageModalMessage, setAgeModalMessage] = useState("")
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: ""
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [editingReview, setEditingReview] = useState(false)
  const [deletingReview, setDeletingReview] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  useEffect(() => {
    loadProduct()
    loadReviews()
    loadStock()
  }, [slug])

  useEffect(() => {
    if (product) {
      checkIfFavorite()
    }
  }, [product, session])

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/products/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product)
      }
    } catch (error) {
      console.error("Error loading product:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStock = async () => {
    try {
      const response = await fetch(`/api/products/${slug}/stock`)
      if (response.ok) {
        const data = await response.json()
        setStockInfo({ totalStock: data.totalStock, inStock: data.inStock })
      }
    } catch (error) {
      console.error("Error loading stock:", error)
    } finally {
      setLoadingStock(false)
    }
  }

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/products/${slug}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        
        // Check if current user has already reviewed
        if (session?.user?.email) {
          const myReview = data.reviews?.find((r: Review) => r.user.email === session.user.email)
          if (myReview) {
            setUserReview(myReview)
          }
        }
      }
    } catch (error) {
      console.error("Error loading reviews:", error)
    }
  }

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      alert("Please sign in to write a review")
      return
    }

    setSubmittingReview(true)

    try {
      const url = editingReview && userReview 
        ? `/api/products/${slug}/reviews/${userReview.id}`
        : `/api/products/${slug}/reviews`
      
      const method = editingReview ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewForm)
      })

      if (response.ok) {
        setReviewForm({ rating: 5, title: "", comment: "" })
        setShowReviewForm(false)
        setEditingReview(false)
        loadReviews()
        loadProduct() // Reload to update average rating
      } else {
        const data = await response.json()
        alert(data.error || "Failed to submit review")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Failed to submit review")
    } finally {
      setSubmittingReview(false)
    }
  }

  const startEditReview = () => {
    if (userReview) {
      setReviewForm({
        rating: userReview.rating,
        title: userReview.title || "",
        comment: userReview.comment
      })
      setEditingReview(true)
      setShowReviewForm(true)
    }
  }

  const confirmDeleteReview = (reviewId: string) => {
    setReviewToDelete(reviewId)
    setShowDeleteModal(true)
  }

  const deleteReview = async () => {
    if (!reviewToDelete) return

    setDeletingReview(reviewToDelete)
    setShowDeleteModal(false)

    try {
      const response = await fetch(`/api/products/${slug}/reviews/${reviewToDelete}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadReviews()
        loadProduct() // Reload to update average rating
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete review")
      }
    } catch (error) {
      console.error("Error deleting review:", error)
      alert("Failed to delete review")
    } finally {
      setDeletingReview(null)
      setReviewToDelete(null)
    }
  }

  const addToCart = async () => {
    if (!product) return
    
    // Block 18+ products for guests
    if (!session && product.ageRestricted) return

    setAddingToCart(true)

    try {
      if (session) {
        // Logged-in user: Use API
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            quantity
          })
        })

        if (response.ok) {
          setQuantity(1) // Reset quantity
          setShowAddedToast(true)
          setTimeout(() => setShowAddedToast(false), 3000)
          
          // Dispatch event to update cart count
          window.dispatchEvent(new Event('cartUpdated'))
        } else {
          const data = await response.json()
          
          // Check if it's an age restriction error
          if (response.status === 403 && data.error) {
            setAgeModalMessage(data.error)
            setShowAgeModal(true)
          } else {
            alert(data.error || "Failed to add to cart")
          }
        }
      } else {
        // Guest user: Use localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
        
        // Check if product already in cart
        const existingIndex = guestCart.findIndex((item: any) => item.productId === product.id)
        
        if (existingIndex >= 0) {
          // Update quantity
          guestCart[existingIndex].quantity += quantity
        } else {
          // Add new item
          guestCart.push({
            productId: product.id,
            productName: product.name,
            productImage: product.images[0],
            productPrice: product.price,
            quantity: quantity,
            ageRestricted: product.ageRestricted
          })
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart))
        setQuantity(1) // Reset quantity
        setShowAddedToast(true)
        setTimeout(() => setShowAddedToast(false), 3000)
        
        // Dispatch event to update cart count
        window.dispatchEvent(new Event('cartUpdated'))
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Failed to add to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const checkIfFavorite = async () => {
    if (!product) return

    if (session) {
      // Check database for logged-in users
      try {
        const response = await fetch(`/api/wishlist/check/${product.id}`)
        if (response.ok) {
          const data = await response.json()
          setIsFavorite(data.isFavorite)
        }
      } catch (error) {
        console.error("Error checking favorite:", error)
      }
    } else {
      // Check localStorage for guests
      const favorites = JSON.parse(localStorage.getItem('guestFavorites') || '[]')
      setIsFavorite(favorites.includes(product.id))
    }
  }

  const toggleFavorite = async () => {
    if (!product) return
    setTogglingFavorite(true)

    try {
      if (session) {
        // Use database for logged-in users
        const response = await fetch('/api/wishlist', {
          method: isFavorite ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id })
        })

        if (response.ok) {
          setIsFavorite(!isFavorite)
        } else {
          const data = await response.json()
          alert(data.error || 'Failed to update favorites')
        }
      } else {
        // Use localStorage for guests
        const favorites = JSON.parse(localStorage.getItem('guestFavorites') || '[]')
        
        if (isFavorite) {
          // Remove from favorites
          const updated = favorites.filter((id: string) => id !== product.id)
          localStorage.setItem('guestFavorites', JSON.stringify(updated))
          setIsFavorite(false)
        } else {
          // Add to favorites
          favorites.push(product.id)
          localStorage.setItem('guestFavorites', JSON.stringify(favorites))
          setIsFavorite(true)
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      alert("Failed to update favorites")
    } finally {
      setTogglingFavorite(false)
    }
  }

  const calculateDiscountedPrice = () => {
    if (!product || !product.discountType || !product.discountValue) return product?.price || 0

    const now = new Date()
    const startDate = product.discountStartDate ? new Date(product.discountStartDate) : null
    const endDate = product.discountEndDate ? new Date(product.discountEndDate) : null

    // Check if discount is active
    if (startDate && now < startDate) return product.price
    if (endDate && now > endDate) return product.price

    if (product.discountType === "PERCENTAGE") {
      return product.price * (1 - product.discountValue / 100)
    } else {
      return product.price - product.discountValue
    }
  }

  const hasActiveDiscount = () => {
    if (!product || !product.discountType || !product.discountValue) return false

    const now = new Date()
    const startDate = product.discountStartDate ? new Date(product.discountStartDate) : null
    const endDate = product.discountEndDate ? new Date(product.discountEndDate) : null

    if (startDate && now < startDate) return false
    if (endDate && now > endDate) return false

    return true
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
          <Link href="/products" className="text-primary hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const discountedPrice = calculateDiscountedPrice()
  const showDiscount = hasActiveDiscount()

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
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Products
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden">
              {product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  No Image
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-zinc-900/80 backdrop-blur-sm border rounded-lg overflow-hidden transition-all ${
                      selectedImage === index ? 'border-primary ring-2 ring-primary' : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 sm:p-6 lg:p-8">
            {/* Category & Age Restriction */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-zinc-800 text-gray-400 text-sm rounded-full capitalize">
                {product.category.toLowerCase().replace('-', ' ')}
              </span>
              {product.ageRestricted && (
                <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                  18+
                </span>
              )}
              {product.featured && (
                <span className="px-3 py-1 bg-primary text-black text-sm font-bold rounded-full">
                  Featured
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
              <StarRating rating={product.averageRating || 0} />
              <span className="text-sm sm:text-base text-gray-400">
                {product.averageRating?.toFixed(1) || '0.0'} ({product.totalReviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              {showDiscount ? (
                <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                    R{discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-lg sm:text-xl lg:text-2xl text-gray-400 line-through">
                    R{product.price.toFixed(2)}
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-primary/20 text-primary text-xs sm:text-sm font-bold rounded-full">
                    {product.discountType === "PERCENTAGE" 
                      ? `${product.discountValue}% OFF`
                      : `R${product.discountValue} OFF`}
                  </span>
                </div>
              ) : (
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                  R{product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* THC/CBD/Strain */}
            {(product.thcContent || product.cbdContent || product.strain) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.thcContent && (
                  <span className="px-4 py-2 bg-green-500/20 text-green-400 font-medium rounded-lg">
                    THC: {product.thcContent}%
                  </span>
                )}
                {product.cbdContent && (
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-400 font-medium rounded-lg">
                    CBD: {product.cbdContent}%
                  </span>
                )}
                {product.strain && (
                  <span className="px-4 py-2 bg-purple-500/20 text-purple-400 font-medium rounded-lg capitalize">
                    {product.strain}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-white mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Disclaimer */}
            <div className="mb-6 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    <span className="font-semibold text-gray-300">Please Note:</span> Product appearance may vary from the image shown. Natural variations in cannabis products mean your item may look slightly different while maintaining the same quality and potency.
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            {!loadingStock && stockInfo && (
              <div className={`p-3 rounded-lg border mb-6 ${
                stockInfo.inStock 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <p className={`text-sm font-bold ${
                  stockInfo.inStock ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stockInfo.inStock 
                    ? `✓ In Stock (${stockInfo.totalStock} available)` 
                    : '✗ Out of Stock'}
                </p>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              {!session && product?.ageRestricted && (
                <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-orange-400 text-sm text-center">
                    🔞 This is an 18+ product. Please <Link href="/login" className="font-bold underline hover:text-orange-300">sign in</Link> to verify your age
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 sm:px-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!session && product?.ageRestricted}
                    className="text-white text-xl font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-white font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!session && product?.ageRestricted}
                    className="text-white text-xl font-bold py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={addToCart}
                  disabled={(product?.ageRestricted && !session) || addingToCart || !stockInfo?.inStock}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-full font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: ((product?.ageRestricted && !session) || addingToCart || !stockInfo?.inStock) ? '#666' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    color: '#000',
                  }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {!stockInfo?.inStock ? "Out of Stock" : addingToCart ? "Adding..." : "Add to Stash"}
                </button>

                <button 
                  onClick={toggleFavorite}
                  disabled={togglingFavorite}
                  className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart 
                    className={`w-6 h-6 transition-colors ${
                      isFavorite 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400 hover:text-red-400'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 sm:p-6 lg:p-8">
          {/* Header with Rating Summary */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">Customer Reviews</h2>
              {session ? (
                userReview ? (
                  <button
                    onClick={startEditReview}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold rounded-full transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                      color: '#000',
                    }}
                  >
                    Edit Your Review
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingReview(false)
                      setShowReviewForm(!showReviewForm)
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold rounded-full transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                      color: '#000',
                    }}
                  >
                    Write a Review
                  </button>
                )
              ) : (
                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-block text-center px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold rounded-full transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    color: '#000',
                  }}
                >
                  Sign In to Review
                </Link>
              )}
            </div>

            {/* Rating Summary */}
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 p-4 sm:p-6 bg-zinc-800 rounded-xl">
              <div className="text-center sm:min-w-[120px]">
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {product.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="mb-2">
                  <StarRating rating={product.averageRating || 0} />
                </div>
                <div className="text-sm text-gray-400">
                  Based on {product.totalReviews || 0} {product.totalReviews === 1 ? 'review' : 'reviews'}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(r => r.rating === rating).length
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm text-gray-400 w-12">{rating} star</span>
                      <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400 w-12 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form onSubmit={submitReview} className="mb-8 p-6 bg-zinc-800 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingReview ? "Edit Your Review" : "Share Your Experience"}
              </h3>
              
              {/* Rating */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= reviewForm.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-600 text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">Title (Optional)</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  placeholder="Sum up your experience"
                  className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-white mb-2">Review *</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  required
                  rows={4}
                  placeholder="Tell us what you think..."
                  className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex items-center gap-2 px-6 py-3 font-bold rounded-full transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: submittingReview ? '#666' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    color: '#000',
                  }}
                >
                  <Send className="w-4 h-4" />
                  {submittingReview 
                    ? (editingReview ? "Updating..." : "Submitting...") 
                    : (editingReview ? "Update Review" : "Submit Review")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-800 rounded-full mb-6">
                  <Star className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No reviews yet</h3>
                <p className="text-gray-400 text-lg mb-6">Be the first to share your experience with this product!</p>
                {session ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-8 py-3 font-bold rounded-full transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                      color: '#000',
                    }}
                  >
                    Write the First Review
                  </button>
                ) : (
                  <div className="inline-block">
                    <p className="text-gray-400 mb-4">Please sign in to write a review</p>
                    <Link
                      href="/login"
                      className="inline-block px-8 py-3 font-bold rounded-full transition-all hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        color: '#000',
                      }}
                    >
                      Sign In to Review
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="p-4 sm:p-6 bg-zinc-800 rounded-xl">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">{review.user.name}</span>
                        {review.verified && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <StarRating rating={review.rating} size="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {session?.user?.role === 'ADMIN' && (
                        <button
                          onClick={() => confirmDeleteReview(review.id)}
                          disabled={deletingReview === review.id}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete review (Admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-bold text-white mb-2">{review.title}</h4>
                  )}
                  
                  <p className="text-gray-300 mb-3">{review.comment}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <button className="text-gray-400 hover:text-white transition-colors">
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Age Restriction Modal */}
        {showAgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowAgeModal(false)}
            />
            
            {/* Modal */}
            <div className="relative bg-zinc-900 border border-red-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                Age Restriction
              </h2>

              {/* Message */}
              <p className="text-gray-300 text-center mb-6">
                {ageModalMessage}
              </p>

              {/* Button */}
              <button
                onClick={() => setShowAgeModal(false)}
                className="w-full py-3 px-6 rounded-full font-bold transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                }}
              >
                I Understand
              </button>
            </div>
          </div>
        )}

        {/* Delete Review Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            
            {/* Modal */}
            <div className="relative bg-zinc-900 border border-red-500 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              {/* Warning Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Trash2 className="w-12 h-12 text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                Delete Review?
              </h2>

              {/* Message */}
              <p className="text-gray-300 text-center mb-6">
                Are you sure you want to delete this review? This action cannot be undone.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 px-6 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteReview}
                  className="flex-1 py-3 px-6 rounded-full font-bold transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#fff',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Added to Cart Toast */}
        {showAddedToast && (
          <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5">
            <div className="px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#000',
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="font-bold">Added to cart!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
