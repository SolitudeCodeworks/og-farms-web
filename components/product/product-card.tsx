"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  image: string
  category: string
  thcContent?: number
  cbdContent?: number
  stock: number
  ageRestricted?: boolean
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  image,
  category,
  thcContent,
  cbdContent,
  stock,
  ageRestricted = false,
}: ProductCardProps) {
  const { data: session } = useSession()
  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0
  
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async () => {
    // Block 18+ products for guests - redirect to login
    if (!session && ageRestricted) {
      window.location.href = '/login'
      return
    }

    setAdding(true)

    try {
      if (session) {
        // Logged-in user: Use API to add to database
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: id,
            quantity: 1
          })
        })

        if (!response.ok) {
          const data = await response.json()
          alert(data.error || "Failed to add to cart")
        } else {
          // Dispatch event to update cart count in header
          window.dispatchEvent(new Event('cartUpdated'))
        }
      } else {
        // Guest user: Use localStorage
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
        
        const existingIndex = guestCart.findIndex((item: any) => item.productId === id)
        
        if (existingIndex >= 0) {
          guestCart[existingIndex].quantity += 1
        } else {
          guestCart.push({
            productId: id,
            productName: name,
            productImage: image,
            productPrice: price,
            quantity: 1,
            ageRestricted: ageRestricted
          })
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart))
        window.dispatchEvent(new Event('cartUpdated'))
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setTimeout(() => setAdding(false), 1000)
    }
  }

  return (
    <div className="group relative" data-aos="fade-up" data-aos-duration="600">
      <Link href={`/products/${slug}`}>
        <div 
          className="relative aspect-square overflow-hidden rounded-2xl transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)',
            border: '1px solid rgba(74, 222, 128, 0.2)',
          }}
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover opacity-60 transition-all group-hover:opacity-80 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div 
              className="absolute left-3 top-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#000',
                boxShadow: '0 4px 15px rgba(74, 222, 128, 0.4)',
              }}
            >
              -{discount}%
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute right-3 top-3 px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md"
               style={{
                 backgroundColor: 'rgba(0, 0, 0, 0.6)',
                 border: '1px solid rgba(74, 222, 128, 0.3)',
                 color: '#4ade80',
               }}>
            {category}
          </div>

          {/* THC/CBD Content */}
          {(thcContent || cbdContent) && (
            <div className="absolute bottom-3 left-3 flex gap-2">
              {thcContent && (
                <div className="px-2 py-1 rounded text-xs font-bold backdrop-blur-md"
                     style={{
                       backgroundColor: 'rgba(74, 222, 128, 0.2)',
                       border: '1px solid rgba(74, 222, 128, 0.4)',
                       color: '#4ade80',
                     }}>
                  THC {thcContent}%
                </div>
              )}
              {cbdContent && (
                <div className="px-2 py-1 rounded text-xs font-bold backdrop-blur-md"
                     style={{
                       backgroundColor: 'rgba(74, 222, 128, 0.2)',
                       border: '1px solid rgba(74, 222, 128, 0.4)',
                       color: '#4ade80',
                     }}>
                  CBD {cbdContent}%
                </div>
              )}
            </div>
          )}

          {stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <span className="text-xl font-bold text-white uppercase tracking-wide">Sold Out</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-4 space-y-2">
        <Link href={`/products/${slug}`}>
          <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-2">
            {name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-primary">
            {formatPrice(price)}
          </span>
          {compareAtPrice && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        <button
          className="w-full py-3 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: (stock === 0 || adding) ? 'rgba(100, 100, 100, 0.3)' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            color: (stock === 0 || adding) ? '#666' : '#000',
            boxShadow: (stock === 0 || adding) ? 'none' : '0 4px 15px rgba(74, 222, 128, 0.3)',
          }}
          disabled={stock === 0 || adding}
          onClick={handleAddToCart}
        >
          {stock === 0 ? "Sold Out" : adding ? "Adding..." : "Add to Stash"}
        </button>
      </div>
    </div>
  )
}
