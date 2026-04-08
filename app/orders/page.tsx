"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react"
import Link from "next/link"

interface OrderItem {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    name: string
    images: string[]
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  subtotal: number
  tax: number
  shippingCost: number
  createdAt: string
  items: OrderItem[]
  shippingAddress: {
    fullName: string
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  } | null
}

const statusConfig = {
  PENDING: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", label: "Pending" },
  PROCESSING: { icon: Package, color: "text-blue-600", bg: "bg-blue-50", label: "Processing" },
  SHIPPED: { icon: Truck, color: "text-purple-600", bg: "bg-purple-50", label: "Shipped" },
  DELIVERED: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Delivered" },
  CANCELLED: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Cancelled" },
}

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      loadOrders()
    }
  }, [status, router])

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/images/weed-icon.png" 
            alt="Loading"
            className="w-20 h-20 animate-spin"
          />
          <p className="text-white text-xl font-bold">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black py-12 px-4 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.4 }}
      >
        <source src="/weed_loop.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">My Orders</h1>
          <Link
            href="/shop"
            className="px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: '#000',
            }}
          >
            Continue Shopping
          </Link>
        </div>

        {orders.length === 0 ? (
          <div 
            className="p-12 rounded-2xl border text-center"
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(74, 222, 128, 0.5)',
            }}
          >
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-black mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-3 rounded-full font-bold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#000',
              }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Package
              const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING

              return (
                <div
                  key={order.id}
                  className="p-6 rounded-2xl border"
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: 'rgba(74, 222, 128, 0.5)',
                  }}
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-black">
                          Order #{order.orderNumber}
                        </h3>
                        <span 
                          className={`px-3 py-1 rounded-full text-sm font-bold ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}
                        >
                          <StatusIcon className="h-4 w-4" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-black">
                        R {order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4 mb-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div 
                          className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden"
                        >
                          {item.product.images && item.product.images[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-black">{item.product.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm font-bold text-black mt-1">
                            R {item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-black">
                            R {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-black font-medium">R {order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-black font-medium">R {order.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-black font-medium">R {order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span className="text-black">Total</span>
                      <span className="text-primary">R {order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-bold text-black mb-2">Shipping Address</h4>
                      <div className="text-sm text-gray-600">
                        <p>{order.shippingAddress.fullName}</p>
                        <p>{order.shippingAddress.street}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
