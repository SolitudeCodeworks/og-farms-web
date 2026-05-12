"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

interface GuestCartItem {
  productId: string
  productName: string
  productImage: string
  productPrice: number
  quantity: number
  ageRestricted: boolean
}

interface DbCartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    images: string[]
    category: string
  }
}

export default function CartPage() {
  const { data: session } = useSession()
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([])
  const [dbCart, setDbCart] = useState<DbCartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deliveryFee, setDeliveryFee] = useState(0)
  const [ageVerified, setAgeVerified] = useState(true)
  const [hasAgeRestrictedItems, setHasAgeRestrictedItems] = useState(false)

  useEffect(() => {
    const loadCart = async () => {
      if (session) {
        // Fetch cart from database for logged-in users
        try {
          const response = await fetch('/api/cart')
          if (response.ok) {
            const data = await response.json()
            setDbCart(data.items || [])
          }
          
          // Check age verification
          const userResponse = await fetch('/api/account')
          if (userResponse.ok) {
            const userData = await userResponse.json()
            setAgeVerified(!!userData.dateOfBirth)
          }
        } catch (error) {
          console.error('Error fetching cart:', error)
        }
      } else {
        // Load guest cart from localStorage
        const cart = JSON.parse(localStorage.getItem('guestCart') || '[]')
        setGuestCart(cart)
        
        // Check if guest cart has age-restricted items
        const hasRestricted = cart.some((item: GuestCartItem) => item.ageRestricted)
        setHasAgeRestrictedItems(hasRestricted)
      }
      await loadDeliveryFee()
      setLoading(false)
    }

    loadCart()

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart()
    }
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [session])

  const loadDeliveryFee = async () => {
    try {
      const response = await fetch('/api/settings/delivery-fee')
      if (response.ok) {
        const data = await response.json()
        setDeliveryFee(data.deliveryFee || 0)
      }
    } catch (error) {
      console.error('Error loading delivery fee:', error)
      setDeliveryFee(0)
    }
  }

  const items = session ? dbCart : guestCart
  const total = session 
    ? dbCart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    : guestCart.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0)
  const shipping = deliveryFee
  const finalTotal = total + shipping

  const updateDbQuantity = async (productId: string, newQuantity: number) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: Math.max(1, newQuantity) })
      })
      if (response.ok) {
        setDbCart(prev => prev.map(item =>
          item.productId === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
        ))
      }
    } catch (error) {
      console.error('Error updating cart:', error)
    }
  }

  const removeDbItem = async (productId: string) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      if (response.ok) {
        setDbCart(prev => prev.filter(item => item.productId !== productId))
      }
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }

  const updateGuestQuantity = (productId: string, newQuantity: number) => {
    const updatedCart = guestCart.map(item =>
      item.productId === productId ? { ...item, quantity: Math.max(1, newQuantity) } : item
    )
    setGuestCart(updatedCart)
    localStorage.setItem('guestCart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeGuestItem = (productId: string) => {
    const updatedCart = guestCart.filter(item => item.productId !== productId)
    setGuestCart(updatedCart)
    localStorage.setItem('guestCart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-gray-400">Loading cart...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-6">
            Add some products to get started
          </p>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

      {/* Age Verification Warning */}
      {session && !ageVerified && (
        <div className="mb-6 p-4 rounded-lg border-2 border-orange-500 bg-orange-500/10">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-orange-500 mb-1">Age Verification Required</h3>
              <p className="text-sm text-orange-400 mb-3">
                We detected that you tried to add age-restricted items (18+) to your cart. These items cannot be added until you verify your age.
              </p>
              <Link 
                href="/account"
                className="inline-block px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#000',
                }}
              >
                Verify Age in Profile →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Guest Age Restricted Warning */}
      {!session && hasAgeRestrictedItems && (
        <div className="mb-6 p-4 rounded-lg border-2 border-orange-500 bg-orange-500/10">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-orange-500 mb-1">Login Required for Age-Restricted Items</h3>
              <p className="text-sm text-orange-400 mb-3">
                Your cart contains age-restricted items (18+). Please sign in and verify your age to proceed with checkout.
              </p>
              <Link 
                href="/login"
                className="inline-block px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#000',
                }}
              >
                Sign In →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const isGuest = 'productName' in item
            const itemImage = isGuest ? (item as GuestCartItem).productImage : (item as DbCartItem).product.images[0]
            const itemName = isGuest ? (item as GuestCartItem).productName : (item as DbCartItem).product.name
            const itemPrice = isGuest ? (item as GuestCartItem).productPrice : (item as DbCartItem).product.price
            const itemCategory = isGuest ? '' : (item as DbCartItem).product.category

            return (
              <div
                key={item.productId}
                className="flex gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={itemImage}
                    alt={itemName}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {itemName}
                      </h3>
                      {itemCategory && (
                        <p className="text-sm text-muted-foreground">
                          {itemCategory}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-foreground">
                      {formatPrice(itemPrice * item.quantity)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          session 
                            ? updateDbQuantity(item.productId, item.quantity - 1)
                            : updateGuestQuantity(item.productId, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          session 
                            ? updateDbQuantity(item.productId, item.quantity + 1)
                            : updateGuestQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => 
                        session 
                          ? removeDbItem(item.productId)
                          : removeGuestItem(item.productId)
                      }
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-card p-6 sticky top-20">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-foreground">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-foreground">
                    Total
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {formatPrice(finalTotal)}
                  </span>
                </div>
              </div>
            </div>

            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Button variant="outline" className="w-full mt-2" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
