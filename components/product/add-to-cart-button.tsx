"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart"
import { addToCart } from "@/lib/actions/cart"
import { useSession } from "next-auth/react"

interface AddToCartButtonProps {
  productId: string
  productName: string
  price: number
  image: string
  category: string
  stock: number
  className?: string
}

export function AddToCartButton({
  productId,
  productName,
  price,
  image,
  category,
  stock,
  className,
}: AddToCartButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const addItemToStore = useCartStore((state) => state.addItem)
  const [loading, setLoading] = useState(false)

  const handleAddToCart = async () => {
    setLoading(true)

    try {
      if (session?.user) {
        // User is logged in - add to database
        const result = await addToCart(productId, 1)
        
        if (result.error && result.useLocalStorage) {
          // Fallback to localStorage if DB fails
          addItemToStore({
            id: productId,
            productId,
            name: productName,
            price,
            image,
            category,
          })
        }
      } else {
        // User not logged in - use localStorage
        addItemToStore({
          id: productId,
          productId,
          name: productName,
          price,
          image,
          category,
        })
      }

      router.refresh()
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      size="lg"
      onClick={handleAddToCart}
      disabled={stock === 0 || loading}
      className={className}
    >
      <ShoppingCart className="mr-2 h-5 w-5" />
      {loading ? "Adding..." : stock === 0 ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}
