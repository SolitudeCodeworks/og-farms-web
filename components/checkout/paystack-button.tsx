"use client"

import { useEffect } from 'react'
import { useCart } from '@/contexts/cart-context'

interface PaystackButtonProps {
  email: string
  amount: number
  onSuccess: (reference: string) => void
  onClose: () => void
}

declare global {
  interface Window {
    PaystackPop: any
  }
}

export function PaystackButton({ email, amount, onSuccess, onClose }: PaystackButtonProps) {
  const { items } = useCart()

  useEffect(() => {
    // Load Paystack inline script
    const script = document.createElement('script')
    script.src = 'https://js.paystack.co/v1/inline.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = () => {
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Paystack expects amount in kobo (cents)
      currency: 'ZAR', // South African Rand
      ref: `OG-${Date.now()}`, // Unique reference
      metadata: {
        custom_fields: [
          {
            display_name: 'Cart Items',
            variable_name: 'cart_items',
            value: items.length,
          },
        ],
      },
      callback: function (response: any) {
        onSuccess(response.reference)
      },
      onClose: function () {
        onClose()
      },
    })
    handler.openIframe()
  }

  return (
    <button
      onClick={handlePayment}
      className="w-full py-4 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105 text-lg"
      style={{
        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
        color: '#000',
        boxShadow: '0 4px 20px rgba(74, 222, 128, 0.4)',
      }}
    >
      Pay with Paystack
    </button>
  )
}
