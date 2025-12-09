"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [processing, setProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processPayment = async () => {
      // PayFast redirects back without payment details in URL
      // The actual payment confirmation comes via webhook
      // We just need to check if we have checkout data and create the order
      
      console.log('PayFast return - processing order')
      
      // Get checkout data from sessionStorage
      const checkoutDataStr = sessionStorage.getItem('checkoutData')
      if (!checkoutDataStr) {
        setError('Checkout session expired. Please try again.')
        setProcessing(false)
        setTimeout(() => router.push('/checkout'), 3000)
        return
      }
      
      // Generate payment reference from the stored data or timestamp
      const checkoutData = JSON.parse(checkoutDataStr)
      const paymentId = checkoutData.paymentId || `OG-RETURN-${Date.now()}`
      
      console.log('Creating order with payment ID:', paymentId)
      await createOrder(paymentId)
    }
    
    const createOrder = async (paymentId: string) => {

      // Get checkout data from sessionStorage
      const checkoutDataStr = sessionStorage.getItem('checkoutData')
      if (!checkoutDataStr) {
        setError('Checkout session expired. Please try again.')
        setProcessing(false)
        setTimeout(() => router.push('/checkout'), 3000)
        return
      }

      const checkoutData = JSON.parse(checkoutDataStr)

      try {
        // Create order in database
        const response = await fetch('/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            items: checkoutData.items,
            customerEmail: checkoutData.email,
            customerName: checkoutData.name,
            customerPhone: checkoutData.phone,
            deliveryMethod: checkoutData.deliveryMethod,
            storeId: checkoutData.storeId,
            address: checkoutData.address,
            paymentReference: paymentId,
            subtotal: checkoutData.subtotal,
            shippingCost: checkoutData.shippingCost,
            totalAmount: checkoutData.totalAmount
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create order')
        }

        const data = await response.json()
        
        // Clear cart
        if (session) {
          // Clear database cart via API
          try {
            await fetch('/api/cart', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ clearAll: true })
            })
          } catch (error) {
            console.error('Error clearing database cart:', error)
          }
        } else {
          // Clear guest cart from localStorage
          localStorage.removeItem('guestCart')
          window.dispatchEvent(new Event('cartUpdated'))
        }

        // Clear checkout data
        sessionStorage.removeItem('checkoutData')
        
        // Redirect to success page with delivery method and store info
        let successUrl = `/order-success?ref=${paymentId}&order=${data.order.orderNumber}&method=${checkoutData.deliveryMethod}`
        if (checkoutData.deliveryMethod === 'pickup' && checkoutData.storeName) {
          successUrl += `&store=${encodeURIComponent(checkoutData.storeName)}`
        }
        router.push(successUrl)
      } catch (error: any) {
        console.error('Error creating order:', error)
        setError(error.message || 'Order creation failed. Please contact support.')
        setProcessing(false)
      }
    }

    processPayment()
  }, [searchParams, session, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center max-w-md mx-auto px-4">
        {processing ? (
          <>
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Processing Your Payment</h1>
            <p className="text-gray-400">Please wait while we confirm your order...</p>
          </>
        ) : error ? (
          <>
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Error</h1>
            <p className="text-gray-400 mb-6">{error}</p>
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
          </>
        ) : null}
      </div>
    </div>
  )
}
