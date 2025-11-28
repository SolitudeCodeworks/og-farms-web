"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store/cart"
import { formatPrice } from "@/lib/utils"

interface GuestCartItem {
  productId: string
  productName: string
  productImage: string
  productPrice: number
  quantity: number
  ageRestricted: boolean
}

export default function CartPage() {
  const { data: session } = useSession()
  const { items: storeItems, updateQuantity, removeItem, getTotalPrice } = useCartStore()
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      // Load guest cart from localStorage
      const cart = JSON.parse(localStorage.getItem('guestCart') || '[]')
      setGuestCart(cart)
    }
    setLoading(false)
  }, [session])

  const items = session ? storeItems : guestCart
  const total = session 
    ? getTotalPrice() 
    : guestCart.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0)
  const tax = total * 0.1 // 10% tax
  const shipping = total > 50 ? 0 : 10
  const finalTotal = total + tax + shipping

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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const isGuest = 'productName' in item
            const itemImage = isGuest ? (item as GuestCartItem).productImage : (item as any).image
            const itemName = isGuest ? (item as GuestCartItem).productName : (item as any).name
            const itemPrice = isGuest ? (item as GuestCartItem).productPrice : (item as any).price
            const itemCategory = isGuest ? '' : (item as any).category

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
                            ? updateQuantity(item.productId, item.quantity - 1)
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
                            ? updateQuantity(item.productId, item.quantity + 1)
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
                          ? removeItem(item.productId)
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
                <span className="text-muted-foreground">Tax (10%)</span>
                <span className="font-medium text-foreground">
                  {formatPrice(tax)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-foreground">
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              {total < 50 && (
                <p className="text-xs text-muted-foreground">
                  Add {formatPrice(50 - total)} more for free shipping
                </p>
              )}
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
