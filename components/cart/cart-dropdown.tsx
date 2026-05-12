"use client"

import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/cart-context'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'

export function CartDropdown() {
  const { data: session } = useSession()
  const { items, removeItem, totalPrice } = useCart()
  const loading = false

  if (loading) {
    return (
      <div className="p-6 min-w-[320px] space-y-4 animate-pulse">
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-zinc-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
            <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-zinc-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
            <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="border-t border-zinc-700 pt-4 space-y-2">
          <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
          <div className="h-10 bg-zinc-700 rounded w-full"></div>
        </div>
      </div>
    )
  }

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
        {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
              }}
            >
              <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(item.price)} x {item.quantity}
                  </span>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
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
