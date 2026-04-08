"use client"

import { useEffect, useRef } from 'react'

interface PayFastButtonProps {
  email: string
  name: string
  amount: number
  phone: string
  deliveryMethod: 'delivery' | 'pickup'
  storeId?: string
  storeName?: string
  address?: {
    street: string
    suburb: string
    city: string
    province: string
    postalCode: string
  }
  items: any[]
  subtotal: number
  shippingCost: number
  onSuccess: (reference: string) => void
  onClose: () => void
}

export function PayFastButton({ 
  email, 
  name, 
  amount, 
  phone,
  deliveryMethod,
  storeId,
  storeName,
  address,
  items,
  subtotal,
  shippingCost,
  onSuccess, 
  onClose 
}: PayFastButtonProps) {
  const formRef = useRef<HTMLFormElement>(null)

  const handlePayment = () => {
    // Generate unique payment reference
    const paymentId = `OG-${Date.now()}`
    
    // Save checkout data to sessionStorage for processing after PayFast redirect
    const checkoutData = {
      paymentId, // Store the payment ID we're sending to PayFast
      email,
      name,
      phone,
      deliveryMethod,
      storeId,
      storeName,
      address,
      items,
      subtotal,
      shippingCost,
      totalAmount: amount
    }
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData))
    
    // Create form data for PayFast
    // For sandbox testing, use PayFast's test credentials
    const isSandbox = process.env.NEXT_PUBLIC_PAYFAST_MODE !== 'live'
    const merchantId = isSandbox ? '10000100' : (process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || '32888465')
    const merchantKey = isSandbox ? '46f0cd694581a' : (process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_KEY || 'm2qsy2eorvjln')
    const returnUrl = `${window.location.origin}/payment/success`
    const cancelUrl = `${window.location.origin}/payment/cancel`
    const notifyUrl = `${window.location.origin}/api/payment/payfast/notify`
    
    // PayFast uses sandbox or live URLs
    const payfastUrl = isSandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process'

    // Create a form and submit it
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = payfastUrl
    
    const fields = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: name.split(' ')[0] || name,
      name_last: name.split(' ').slice(1).join(' ') || '',
      email_address: email,
      m_payment_id: paymentId,
      amount: amount.toFixed(2),
      item_name: 'OG Farms Order',
      item_description: 'Cannabis products order',
      email_confirmation: '1',
      confirmation_address: email,
    }

    // Add fields to form
    Object.entries(fields).forEach(([key, value]) => {
      if (value) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = value.toString()
        form.appendChild(input)
      }
    })

    document.body.appendChild(form)
    form.submit()
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
      Pay with PayFast
    </button>
  )
}
