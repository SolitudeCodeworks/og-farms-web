"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, Clock, MapPin } from "lucide-react"

interface Order {
  id: string
  orderNumber: string
  status: string
  fulfillmentType: string
  total: number
  createdAt: string
  user: {
    name: string
    email: string
  }
  pickupStore?: {
    name: string
    city: string
  }
  shippingAddress?: {
    fullName: string
    street: string
    city: string
    state: string
    zipCode: string
  }
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      images: string[]
    }
  }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        loadOrders()
      }
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-5 h-5" />
      case "PROCESSING": return <Package className="w-5 h-5" />
      case "SHIPPED": return <Truck className="w-5 h-5" />
      case "DELIVERED": return <CheckCircle className="w-5 h-5" />
      case "READY_FOR_PICKUP": return <Package className="w-5 h-5" />
      case "PICKED_UP": return <CheckCircle className="w-5 h-5" />
      case "CANCELLED": return <XCircle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500/20 text-yellow-400"
      case "PROCESSING": return "bg-blue-500/20 text-blue-400"
      case "SHIPPED": return "bg-purple-500/20 text-purple-400"
      case "DELIVERED": return "bg-green-500/20 text-green-400"
      case "READY_FOR_PICKUP": return "bg-primary/20 text-primary"
      case "PICKED_UP": return "bg-green-500/20 text-green-400"
      case "CANCELLED": return "bg-red-500/20 text-red-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const filteredOrders = orders
    .filter(order => {
      // Status filter
      if (filter !== "all" && order.status !== filter) return false
      
      // Fulfillment type filter
      if (fulfillmentFilter !== "all" && order.fulfillmentType !== fulfillmentFilter) return false
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          order.orderNumber.toLowerCase().includes(query) ||
          order.user?.name?.toLowerCase().includes(query) ||
          order.user?.email?.toLowerCase().includes(query)
        )
      }
      
      return true
    })

  const pendingCount = orders.filter(o => o.status === "PENDING").length
  const deliveryCount = orders.filter(o => o.fulfillmentType === "DELIVERY").length
  const pickupCount = orders.filter(o => o.fulfillmentType === "PICKUP").length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/images/weed-icon.png" 
            alt="Loading"
            className="w-16 h-16 animate-spin"
          />
          <p className="text-white text-lg">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
        <p className="text-gray-400">Manage customer orders and fulfillment</p>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search by order number, customer name, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Fulfillment Type Filters */}
      <div>
        <p className="text-sm font-medium text-gray-400 mb-2">Fulfillment Type:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFulfillmentFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              fulfillmentFilter === "all" 
                ? "bg-primary text-black" 
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFulfillmentFilter("DELIVERY")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              fulfillmentFilter === "DELIVERY" 
                ? "bg-purple-500 text-black" 
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            <Truck className="w-4 h-4" />
            Delivery ({deliveryCount})
          </button>
          <button
            onClick={() => setFulfillmentFilter("PICKUP")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              fulfillmentFilter === "PICKUP" 
                ? "bg-orange-500 text-black" 
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Store Pickup ({pickupCount})
          </button>
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <p className="text-sm font-medium text-gray-400 mb-2">Order Status:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all" 
                ? "bg-primary text-black" 
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            All Status
          </button>
        <button
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "PENDING" 
              ? "bg-yellow-500 text-black" 
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter("PROCESSING")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "PROCESSING" 
              ? "bg-blue-500 text-black" 
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
        >
          Processing
        </button>
        <button
          onClick={() => setFilter("READY_FOR_PICKUP")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === "READY_FOR_PICKUP" 
              ? "bg-primary text-black" 
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
        >
          Ready for Pickup
        </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No orders found</h3>
          <p className="text-gray-400">
            {filter === "all" ? "No orders yet" : `No ${filter.toLowerCase()} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-primary/50 transition-all"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">#{order.orderNumber}</h3>
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-gray-300">
                      {order.fulfillmentType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.user.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">R{order.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg">
                    {item.product.images[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white font-bold">R{item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Fulfillment Info */}
              <div className="flex items-start gap-3 p-3 bg-zinc-800 rounded-lg mb-4">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="text-sm">
                  {order.fulfillmentType === "PICKUP" && order.pickupStore ? (
                    <>
                      <p className="text-white font-medium">Pickup Location:</p>
                      <p className="text-gray-300">{order.pickupStore.name}</p>
                      <p className="text-gray-400">{order.pickupStore.city}</p>
                    </>
                  ) : order.shippingAddress ? (
                    <>
                      <p className="text-white font-medium">Delivery Address:</p>
                      <p className="text-gray-300">{order.shippingAddress.fullName}</p>
                      <p className="text-gray-400">{order.shippingAddress.street}</p>
                      <p className="text-gray-400">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {order.status === "PENDING" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "PROCESSING")}
                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    Start Processing
                  </button>
                )}
                {order.status === "PROCESSING" && order.fulfillmentType === "PICKUP" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "READY_FOR_PICKUP")}
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium rounded-lg transition-colors"
                  >
                    Mark Ready for Pickup
                  </button>
                )}
                {order.status === "READY_FOR_PICKUP" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "PICKED_UP")}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    Mark as Picked Up
                  </button>
                )}
                {order.status === "PROCESSING" && order.fulfillmentType === "DELIVERY" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "SHIPPED")}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    Mark as Shipped
                  </button>
                )}
                {order.status === "SHIPPED" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "DELIVERED")}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-medium rounded-lg transition-colors"
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
