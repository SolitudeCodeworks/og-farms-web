"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/cart-context'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'

interface GuestCartItem {
  productId: string
  productName: string
  productImage: string
  productPrice: number
  quantity: number
  ageRestricted: boolean
}

export function CartDropdown() {
  const { data: session } = useSession()
  const { items: loggedInItems, removeItem: removeLoggedInItem, totalPrice: loggedInTotal } = useCart()
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([])

  useEffect(() => {
    const updateGuestCart = () => {
      if (!session) {
        const cart = JSON.parse(localStorage.getItem('guestCart') || '[]')
        setGuestCart(cart)
      }
    }

    updateGuestCart()
    window.addEventListener('cartUpdated', updateGuestCart)
    
    return () => window.removeEventListener('cartUpdated', updateGuestCart)
  }, [session])

  const removeGuestItem = (productId: string) => {
    const updatedCart = guestCart.filter(item => item.productId !== productId)
    setGuestCart(updatedCart)
    localStorage.setItem('guestCart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const items = session ? loggedInItems : guestCart
  const totalPrice = session 
    ? loggedInTotal 
    : guestCart.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0)

  if (items.length === 0) {
    return (
      <div className="p-8 text-center min-w-[280px]">
        <p className="text-lg text-gray-400">Your stash is empty</p>
        <p className="text-sm text-gray-500 mt-2">Add some products to get started</p>
      </div>
    )
  }

  return (
    <div className="w-80 max-h-96 overflow-y-auto">
      <div className="p-4 space-y-4">
        {items.map((item) => {
          const isGuest = 'productName' in item
          const itemId = isGuest ? (item as GuestCartItem).productId : (item as any).id
          const itemImage = isGuest ? (item as GuestCartItem).productImage : (item as any).image
          const itemName = isGuest ? (item as GuestCartItem).productName : (item as any).name
          const itemPrice = isGuest ? (item as GuestCartItem).productPrice : (item as any).price
          const itemCategory = isGuest ? '' : (item as any).category
          const itemQuantity = item.quantity

          return (
            <div
              key={itemId}
              className="flex gap-3 p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
              }}
            >
              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <Image
                  src={itemImage}
                  alt={itemName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{itemName}</h4>
                {itemCategory && <p className="text-xs text-gray-400">{itemCategory}</p>}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(itemPrice)} x {itemQuantity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => session ? removeLoggedInItem(itemId) : removeGuestItem(itemId)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>

      <div
        className="p-4 border-t"
        style={{ borderColor: 'rgba(74, 222, 128, 0.2)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <span className="text-white font-bold text-lg">Total:</span>
          <span className="text-2xl font-bold" style={{ color: '#4ade80' }}>
            {formatPrice(totalPrice)}
          </span>
        </div>
        <div className="space-y-3">
          <Link href="/checkout" className="block">
            <button
              className="w-full py-4 rounded-xl font-bold text-base uppercase tracking-wide transition-all hover:scale-105 hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#000',
                boxShadow: '0 4px 20px rgba(74, 222, 128, 0.4)',
              }}
            >
              Checkout
            </button>
          </Link>
          <Link href="/cart" className="block">
            <button
              className="w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wide transition-all hover:scale-105 border-2 hover:bg-primary/10"
              style={{
                borderColor: '#4ade80',
                backgroundColor: 'transparent',
                color: '#4ade80',
              }}
            >
              View Cart
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
