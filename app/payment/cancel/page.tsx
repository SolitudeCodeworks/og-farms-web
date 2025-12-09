"use client"

import { useRouter } from 'next/navigation'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-6">
          <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">Payment Cancelled</h1>
        <p className="text-gray-400 mb-8">
          Your payment was cancelled. Your cart items are still saved.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push('/checkout')}
            className="px-6 py-3 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: '#000',
            }}
          >
            Back to Checkout
          </button>
          <button
            onClick={() => router.push('/shop')}
            className="px-6 py-3 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105 bg-gray-700 text-white"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
