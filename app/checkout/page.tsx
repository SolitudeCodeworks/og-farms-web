"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCart } from '@/contexts/cart-context'
import { formatPrice } from '@/lib/utils'
import { PaystackButton } from '@/components/checkout/paystack-button'
import { AddressAutocomplete } from '@/components/checkout/address-autocomplete'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Truck, Store } from 'lucide-react'

interface GuestCartItem {
  productId: string
  productName: string
  productImage: string
  productPrice: number
  quantity: number
  ageRestricted: boolean
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items: loggedInItems, totalPrice: loggedInTotal, clearCart } = useCart()
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([])
  const [dbCart, setDbCart] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery')
  const [selectedStore, setSelectedStore] = useState('')
  const [stores, setStores] = useState<any[]>([])
  const [storeStock, setStoreStock] = useState<Record<string, number>>({})
  const [checkingStock, setCheckingStock] = useState(false)
  const [deliveryFee, setDeliveryFee] = useState(0)

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
        } catch (error) {
          console.error('Error fetching cart:', error)
          setDbCart([])
        }
      } else {
        const cart = JSON.parse(localStorage.getItem('guestCart') || '[]')
        setGuestCart(cart)
      }
      await loadStores()
      await loadDeliveryFee()
      setLoading(false)
    }
    
    loadCart()
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

  const loadStores = async () => {
    try {
      const response = await fetch('/api/stores')
      if (response.ok) {
        const data = await response.json()
        setStores(data.stores || [])
      }
    } catch (error) {
      console.error('Error loading stores:', error)
    }
  }

  const checkStoreStock = async (storeId: string) => {
    setCheckingStock(true)
    setStoreStock({}) // Clear previous stock data
    const stockMap: Record<string, number> = {}
    
    for (const item of items) {
      const isGuest = 'productName' in item
      const productId = isGuest ? (item as GuestCartItem).productId : (item as any).productId
      
      try {
        const response = await fetch(`/api/stores/${storeId}/stock/${productId}`)
        if (response.ok) {
          const data = await response.json()
          stockMap[productId] = data.quantity || 0
        }
      } catch (error) {
        console.error('Error checking stock:', error)
        stockMap[productId] = 0
      }
    }
    
    setStoreStock(stockMap)
    setCheckingStock(false)
  }

  const handleStoreChange = (storeId: string) => {
    setSelectedStore(storeId)
    if (storeId) {
      checkStoreStock(storeId)
    }
  }

  const items = session ? dbCart : guestCart
  const totalPrice = session 
    ? dbCart.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0)
    : guestCart.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0)

  const handleSuccess = async (reference: string) => {
    setIsProcessing(true)
    
    try {
      // Calculate shipping cost based on delivery method
      const shippingCost = deliveryMethod === 'delivery' ? deliveryFee : 0
      const finalTotal = totalPrice + shippingCost
      
      // Create order in database
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items,
          customerEmail: email,
          customerName: name,
          customerPhone: phone,
          deliveryMethod,
          storeId: selectedStore,
          address: deliveryMethod === 'delivery' ? {
            street,
            suburb,
            city,
            province,
            postalCode
          } : null,
          paymentReference: reference,
          subtotal: totalPrice,
          shippingCost: shippingCost,
          totalAmount: finalTotal
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const data = await response.json()
      
      // Clear cart
      if (session) {
        clearCart()
      } else {
        localStorage.removeItem('guestCart')
        window.dispatchEvent(new Event('cartUpdated'))
      }
      
      // Redirect to success page with delivery method and store info
      let successUrl = `/order-success?ref=${reference}&order=${data.order.orderNumber}&method=${deliveryMethod}`
      if (deliveryMethod === 'pickup' && selectedStore) {
        const store = stores.find(s => s.id === selectedStore)
        if (store) {
          successUrl += `&store=${encodeURIComponent(store.name)}`
        }
      }
      router.push(successUrl)
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Order creation failed. Please contact support with reference: ' + reference)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    console.log('Payment popup closed')
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-black">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          style={{ opacity: 0.7 }}
        >
          <source src="/weed_loop.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        <div className="relative z-10 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
              Checkout
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Skeleton for Customer Details */}
              <div>
                <div className="p-8 rounded-2xl border backdrop-blur-sm animate-pulse" style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderColor: 'rgba(74, 222, 128, 0.3)',
                }}>
                  <div className="h-8 bg-zinc-700 rounded w-1/3 mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-12 bg-zinc-700 rounded"></div>
                    <div className="h-12 bg-zinc-700 rounded"></div>
                    <div className="h-12 bg-zinc-700 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Skeleton for Order Summary */}
              <div>
                <div className="p-8 rounded-2xl border backdrop-blur-sm animate-pulse" style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderColor: 'rgba(74, 222, 128, 0.3)',
                }}>
                  <div className="h-8 bg-zinc-700 rounded w-1/2 mb-6"></div>
                  <div className="space-y-4">
                    <div className="h-20 bg-zinc-700 rounded"></div>
                    <div className="h-20 bg-zinc-700 rounded"></div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-zinc-700">
                    <div className="h-6 bg-zinc-700 rounded w-3/4 mb-2"></div>
                    <div className="h-10 bg-zinc-700 rounded w-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
    <>
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-6 relative">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-primary/30 border-t-primary animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Processing Your Order...</h2>
            <p className="text-gray-400">Please wait while we confirm your payment</p>
          </div>
        </div>
      )}

      <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.7 }}
      >
        <source src="/weed_loop.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      <div className="relative z-10 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Customer Details */}
          <div>
            <div
              className="p-8 rounded-2xl border backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderColor: 'rgba(74, 222, 128, 0.3)',
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Your Details</h2>
              
              {/* Delivery Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-white mb-3">
                  Delivery Method *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                      deliveryMethod === 'delivery' ? 'scale-105' : ''
                    }`}
                    style={{
                      background: deliveryMethod === 'delivery' 
                        ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' 
                        : '#f3f4f6',
                      color: deliveryMethod === 'delivery' ? '#000' : '#6b7280',
                      boxShadow: deliveryMethod === 'delivery' ? '0 4px 15px rgba(74, 222, 128, 0.4)' : 'none',
                    }}
                  >
                    <Truck className="h-5 w-5" />
                    Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                      deliveryMethod === 'pickup' ? 'scale-105' : ''
                    }`}
                    style={{
                      background: deliveryMethod === 'pickup' 
                        ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' 
                        : '#f3f4f6',
                      color: deliveryMethod === 'pickup' ? '#000' : '#6b7280',
                      boxShadow: deliveryMethod === 'pickup' ? '0 4px 15px rgba(74, 222, 128, 0.4)' : 'none',
                    }}
                  >
                    <Store className="h-5 w-5" />
                    Store Pickup
                  </button>
                </div>
              </div>

              {/* Store Selection for Pickup */}
              {deliveryMethod === 'pickup' && (
                <div className="mb-6 p-5 rounded-xl border-2" style={{
                  backgroundColor: 'rgba(74, 222, 128, 0.1)',
                  borderColor: 'rgba(74, 222, 128, 0.4)',
                }}>
                  <label className="block text-sm font-bold text-white mb-3">
                    Select Pickup Store *
                  </label>
                  <select
                    value={selectedStore}
                    onChange={(e) => handleStoreChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white text-black font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    style={{
                      border: '2px solid rgba(74, 222, 128, 0.5)',
                    }}
                    required
                  >
                    <option value="">Choose a store...</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name} - {store.city}
                      </option>
                    ))}
                  </select>
                  
                  {selectedStore && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-bold text-white">Stock Availability:</p>
                      {checkingStock ? (
                        // Skeleton loader
                        items.map((item, index) => {
                          const isGuest = 'productName' in item
                          const productName = isGuest ? (item as GuestCartItem).productName : (item as any).name
                          return (
                            <div key={index} className="flex items-center justify-between text-sm animate-pulse">
                              <span className="text-white">{productName}</span>
                              <div className="h-4 w-24 bg-gray-300 rounded"></div>
                            </div>
                          )
                        })
                      ) : Object.keys(storeStock).length > 0 ? (
                        items.map((item) => {
                          const isGuest = 'productName' in item
                          const productId = isGuest ? (item as GuestCartItem).productId : (item as any).id
                          const productName = isGuest ? (item as GuestCartItem).productName : (item as any).name
                          const stock = storeStock[productId] || 0
                          const hasStock = stock >= item.quantity
                          
                          return (
                            <div key={productId} className="flex items-center justify-between text-sm">
                              <span className="text-white">{productName}</span>
                              <span className={`font-bold ${
                                hasStock ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {hasStock ? `✓ ${stock} available` : `✗ Only ${stock} in stock`}
                              </span>
                            </div>
                          )
                        })
                      ) : null}
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
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
                  <label className="block text-sm font-bold text-white mb-2">
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
                  <label className="block text-sm font-bold text-white mb-2">
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

                {deliveryMethod === 'delivery' && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white mb-6">Delivery Address</h2>

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
                      <label className="block text-sm font-bold text-white mb-2">
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
                      <label className="block text-sm font-bold text-white mb-2">
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
                      <label className="block text-sm font-bold text-white mb-2">
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
                      <label className="block text-sm font-bold text-white mb-2">
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
                      <label className="block text-sm font-bold text-white mb-2">
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
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div
              className="p-8 rounded-2xl border backdrop-blur-sm sticky top-24"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                borderColor: 'rgba(74, 222, 128, 0.3)',
              }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const isGuest = 'productName' in item
                  const itemId = isGuest ? (item as GuestCartItem).productId : (item as any).productId
                  const itemImage = isGuest ? (item as GuestCartItem).productImage : (item as any).product?.images?.[0] || '/products/placeholder.svg'
                  const itemName = isGuest ? (item as GuestCartItem).productName : (item as any).product?.name
                  const itemPrice = isGuest ? (item as GuestCartItem).productPrice : (item as any).product?.price
                  const itemCategory = isGuest ? '' : (item as any).product?.category
                  const itemQuantity = item.quantity

                  return (
                    <div
                      key={itemId}
                      className="flex gap-4 p-3 rounded-lg"
                      style={{
                        backgroundColor: 'rgba(74, 222, 128, 0.05)',
                        border: '1px solid rgba(74, 222, 128, 0.3)',
                      }}
                    >
                      <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                        <Image
                          src={itemImage}
                          alt={itemName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white">{itemName}</h4>
                        {itemCategory && <p className="text-xs text-gray-400">{itemCategory}</p>}
                        <p className="text-sm text-primary font-bold mt-1">
                          {formatPrice(itemPrice)} x {itemQuantity}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t pt-4 mb-6" style={{ borderColor: 'rgba(74, 222, 128, 0.2)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white font-bold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Delivery:</span>
                  <span className="text-white font-bold">
                    {deliveryMethod === 'pickup' ? 'FREE' : (deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xl mt-4 pt-3 border-t" style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}>
                  <span className="text-white font-bold">Total:</span>
                  <span className="font-bold" style={{ color: '#4ade80', fontSize: '1.5rem' }}>
                    {formatPrice(totalPrice + (deliveryMethod === 'delivery' ? deliveryFee : 0))}
                  </span>
                </div>
              </div>

              {(() => {
                // Check if all required fields are filled
                const hasRequiredFields = email && name && phone && (deliveryMethod === 'pickup' ? selectedStore : (street && suburb && city && province && postalCode))
                
                // Check if all items have sufficient stock for pickup
                const hasInsufficientStock = deliveryMethod === 'pickup' && selectedStore && Object.keys(storeStock).length > 0 && items.some((item) => {
                  const isGuest = 'productName' in item
                  const productId = isGuest ? (item as GuestCartItem).productId : (item as any).id
                  const stock = storeStock[productId] || 0
                  return stock < item.quantity
                })

                if (hasRequiredFields && !hasInsufficientStock) {
                  return (
                    <PaystackButton
                      email={email}
                      amount={totalPrice}
                      onSuccess={handleSuccess}
                      onClose={handleClose}
                    />
                  )
                } else {
                  let buttonText = 'Fill in all details'
                  if (deliveryMethod === 'pickup' && !selectedStore) {
                    buttonText = 'Select a pickup store'
                  } else if (hasInsufficientStock) {
                    buttonText = 'Insufficient stock at selected store'
                  }

                  return (
                    <button
                      disabled
                      className="w-full py-4 rounded-full font-bold uppercase tracking-wide text-lg opacity-50 cursor-not-allowed"
                      style={{
                        background: 'rgba(100, 100, 100, 0.3)',
                        color: '#666',
                      }}
                    >
                      {buttonText}
                    </button>
                  )
                }
              })()}

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment powered by Paystack
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
      </div>
    </>
  )
}
