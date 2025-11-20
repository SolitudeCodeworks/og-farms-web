"use client"

import { useState } from 'react'
import { useCart } from '@/contexts/cart-context'
import { formatPrice } from '@/lib/utils'
import { PaystackButton } from '@/components/checkout/paystack-button'
import { AddressAutocomplete } from '@/components/checkout/address-autocomplete'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [suburb, setSuburb] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSuccess = (reference: string) => {
    setIsProcessing(true)
    // Here you would typically save the order to your database
    console.log('Payment successful! Reference:', reference)
    
    // Clear cart and redirect to success page
    clearCart()
    router.push(`/order-success?ref=${reference}`)
  }

  const handleClose = () => {
    console.log('Payment popup closed')
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
          <p className="text-gray-400 mb-8">Add some products before checking out</p>
          <a
            href="/shop"
            className="inline-block px-8 py-3 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: '#000',
              boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)',
            }}
          >
            Shop Now
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Customer Details */}
          <div>
            <div
              className="p-8 rounded-2xl border"
              style={{
                backgroundColor: '#ffffff',
                borderColor: 'rgba(74, 222, 128, 0.5)',
              }}
            >
              <h2 className="text-2xl font-bold text-black mb-6">Your Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                    style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                    style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                    style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-black">Delivery Address</h3>
                  
                  <AddressAutocomplete
                    onAddressSelect={(address) => {
                      setStreet(address.street)
                      setSuburb(address.suburb)
                      setCity(address.city)
                      setProvince(address.province)
                      setPostalCode(address.postalCode)
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Street *
                      </label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                        style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Suburb *
                      </label>
                      <input
                        type="text"
                        value={suburb}
                        onChange={(e) => setSuburb(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                        style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                        style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Province *
                      </label>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                        style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                        style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div
              className="p-8 rounded-2xl border sticky top-24"
              style={{
                backgroundColor: '#ffffff',
                borderColor: 'rgba(74, 222, 128, 0.5)',
              }}
            >
              <h2 className="text-2xl font-bold text-black mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(74, 222, 128, 0.05)',
                      border: '1px solid rgba(74, 222, 128, 0.3)',
                    }}
                  >
                    <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-black">{item.name}</h4>
                      <p className="text-xs text-gray-600">{item.category}</p>
                      <p className="text-sm text-primary font-bold mt-1">
                        {formatPrice(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-6" style={{ borderColor: 'rgba(74, 222, 128, 0.2)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-black font-bold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Delivery:</span>
                  <span className="text-black font-bold">FREE</span>
                </div>
                <div className="flex justify-between items-center text-xl mt-4">
                  <span className="text-black font-bold">Total:</span>
                  <span className="text-primary font-bold">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {email && name && phone && street && suburb && city && province && postalCode ? (
                <PaystackButton
                  email={email}
                  amount={totalPrice}
                  onSuccess={handleSuccess}
                  onClose={handleClose}
                />
              ) : (
                <button
                  disabled
                  className="w-full py-4 rounded-full font-bold uppercase tracking-wide text-lg opacity-50 cursor-not-allowed"
                  style={{
                    background: 'rgba(100, 100, 100, 0.3)',
                    color: '#666',
                  }}
                >
                  Fill in all details
                </button>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment powered by Paystack
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
