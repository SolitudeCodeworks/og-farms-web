"use client"

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('ref')

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-2xl px-4">
        <div className="mb-8">
          <div 
            className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            }}
          >
            <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Order Successful! 🎉
          </h1>
          
          <p className="text-xl text-gray-400 mb-6">
            Your payment has been processed successfully
          </p>

          {reference && (
            <div 
              className="inline-block px-6 py-3 rounded-lg mb-8"
              style={{
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
              }}
            >
              <p className="text-sm text-gray-400 mb-1">Reference Number</p>
              <p className="text-lg font-bold text-primary">{reference}</p>
            </div>
          )}

          <div className="space-y-4 text-left mb-8 max-w-md mx-auto">
            <div 
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
              }}
            >
              <h3 className="text-white font-bold mb-2">📧 What's Next?</h3>
              <p className="text-gray-400 text-sm">
                You'll receive an order confirmation email shortly with tracking details.
              </p>
            </div>

            <div 
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(74, 222, 128, 0.2)',
              }}
            >
              <h3 className="text-white font-bold mb-2">🚚 Delivery</h3>
              <p className="text-gray-400 text-sm">
                Your order will be delivered within 2-3 business days.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <button
                className="px-8 py-3 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: '#000',
                  boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)',
                }}
              >
                Continue Shopping
              </button>
            </Link>
            
            <Link href="/">
              <button
                className="px-8 py-3 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105 border-2"
                style={{
                  borderColor: '#4ade80',
                  backgroundColor: 'transparent',
                  color: '#4ade80',
                }}
              >
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <OrderSuccessContent />
    </Suspense>
  )
}
