"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Package, Truck, CheckCircle, XCircle, Clock, MapPin, AlertTriangle, Loader2, ChevronLeft, ChevronRight, User, Mail, Phone } from "lucide-react"

interface Order {
  id: string
  orderNumber: string
  status: string
  fulfillmentType: string
  total: number
  subtotal: number
  shippingCost: number
  customerEmail: string
  customerName: string
  customerPhone: string
  deliveryStreet?: string | null
  deliveryCity?: string | null
  deliveryState?: string | null
  deliveryZipCode?: string | null
  deliveryCountry?: string | null
  createdAt: string
  pickupStoreId?: string
  paymentReference?: string
  user?: {
    name: string
    email: string
  }
  pickupStore?: {
    id: string
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

interface Store {
  id: string
  name: string
  city: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>("all")
  const [storeFilter, setStoreFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    orderId: string
    action: 'cancel' | 'refund' | null
    orderNumber: string
  }>({ isOpen: false, orderId: '', action: null, orderNumber: '' })
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean
    orderId: string
    currentStatus: string
    fulfillmentType: string
    orderNumber: string
  }>({ isOpen: false, orderId: '', currentStatus: '', fulfillmentType: '', orderNumber: '' })
  const [customerInfoModal, setCustomerInfoModal] = useState<{
    isOpen: boolean
    order: Order | null
  }>({ isOpen: false, order: null })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadOrders()
    loadStores()
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

  const loadStores = async () => {
    try {
      const response = await fetch("/api/admin/stores")
      if (response.ok) {
        const data = await response.json()
        setStores(data.stores || [])
      }
    } catch (error) {
      console.error("Error loading stores:", error)
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

  const handleConfirmAction = async () => {
    if (!confirmModal.action || !confirmModal.orderId || isProcessing) return
    
    setIsProcessing(true)
    try {
      const newStatus = confirmModal.action === 'cancel' ? 'CANCELLED' : 'REFUNDED'
      await updateOrderStatus(confirmModal.orderId, newStatus)
      setConfirmModal({ isOpen: false, orderId: '', action: null, orderNumber: '' })
    } catch (error) {
      console.error('Error processing action:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getNextStatus = (currentStatus: string, fulfillmentType: string) => {
    if (currentStatus === 'PENDING') return 'PROCESSING'
    if (currentStatus === 'PROCESSING') {
      return fulfillmentType === 'PICKUP' ? 'PICKED_UP' : 'OUT_FOR_DELIVERY'
    }
    if (currentStatus === 'OUT_FOR_DELIVERY' || currentStatus === 'PICKED_UP') return 'COMPLETED'
    return null
  }

  const getNextStatusLabel = (currentStatus: string, fulfillmentType: string) => {
    if (currentStatus === 'PENDING') return 'Start Processing'
    if (currentStatus === 'PROCESSING') {
      return fulfillmentType === 'PICKUP' ? 'Customer Picked Up' : 'Out for Delivery'
    }
    if (currentStatus === 'OUT_FOR_DELIVERY' || currentStatus === 'PICKED_UP') return 'Mark as Completed'
    return null
  }

  const handleNextStatus = async () => {
    if (!actionModal.orderId || isProcessing) return
    
    const nextStatus = getNextStatus(actionModal.currentStatus, actionModal.fulfillmentType)
    if (!nextStatus) return

    setIsProcessing(true)
    try {
      await updateOrderStatus(actionModal.orderId, nextStatus)
      setActionModal({ isOpen: false, orderId: '', currentStatus: '', fulfillmentType: '', orderNumber: '' })
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-5 h-5" />
      case "PROCESSING": return <Package className="w-5 h-5" />
      case "OUT_FOR_DELIVERY": return <Truck className="w-5 h-5" />
      case "PICKED_UP": return <CheckCircle className="w-5 h-5" />
      case "COMPLETED": return <CheckCircle className="w-5 h-5" />
      case "CANCELLED": return <XCircle className="w-5 h-5" />
      case "REFUNDED": return <XCircle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-500/20 text-yellow-400"
      case "PROCESSING": return "bg-blue-500/20 text-blue-400"
      case "OUT_FOR_DELIVERY": return "bg-purple-500/20 text-purple-400"
      case "PICKED_UP": return "bg-green-500/20 text-green-400"
      case "COMPLETED": return "bg-green-500/20 text-green-400"
      case "CANCELLED": return "bg-red-500/20 text-red-400"
      case "REFUNDED": return "bg-orange-500/20 text-orange-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const filteredOrders = orders
    .filter(order => {
      // Status filter
      if (filter !== "all" && order.status !== filter) return false
      
      // Fulfillment type filter
      if (fulfillmentFilter !== "all" && order.fulfillmentType !== fulfillmentFilter) return false
      
      // Store filter
      if (storeFilter !== "all" && order.pickupStoreId !== storeFilter) return false
      
      // Date filter
      if (dateFilter !== "all") {
        const orderDate = new Date(order.createdAt)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        switch (dateFilter) {
          case "today":
            if (orderDate < today) return false
            break
          case "week":
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            if (orderDate < weekAgo) return false
            break
          case "month":
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            if (orderDate < monthAgo) return false
            break
        }
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          order.orderNumber.toLowerCase().includes(query) ||
          order.user?.name?.toLowerCase().includes(query) ||
          order.user?.email?.toLowerCase().includes(query) ||
          order.pickupStore?.name?.toLowerCase().includes(query)
        )
      }
      
      return true
    })

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filter, fulfillmentFilter, storeFilter, dateFilter, searchQuery])

  const pendingCount = orders.filter(o => o.status === "PENDING").length
  const deliveryCount = orders.filter(o => o.fulfillmentType === "DELIVERY").length
  const pickupCount = orders.filter(o => o.fulfillmentType === "PICKUP").length
  const todayCount = orders.filter(o => {
    const orderDate = new Date(o.createdAt)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return orderDate >= today
  }).length

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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Filtered Results</p>
          <p className="text-2xl font-bold text-primary">{filteredOrders.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Active Orders</p>
          <p className="text-2xl font-bold text-blue-400">
            {orders.filter(o => o.status === 'PROCESSING' || o.status === 'OUT_FOR_DELIVERY' || o.status === 'PICKED_UP').length}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-400">
            R{filteredOrders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search by order number, customer name, email, or store..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
      </div>

      {/* Date Range Filters */}
      <div>
        <p className="text-sm font-medium text-gray-400 mb-2">Date Range:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDateFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateFilter === "all" 
                ? "bg-primary text-black" 
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateFilter("today")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateFilter === "today" 
                ? "bg-blue-500 text-black" 
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            Today ({todayCount})
          </button>
          <button
            onClick={() => setDateFilter("week")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateFilter === "week" 
                ? "bg-purple-500 text-black" 
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateFilter("month")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateFilter === "month" 
                ? "bg-orange-500 text-black" 
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Store Filters */}
      {stores.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-400 mb-2">Filter by Store:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStoreFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                storeFilter === "all" 
                  ? "bg-primary text-black" 
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              All Stores
            </button>
            {stores.map((store) => {
              const storeOrderCount = orders.filter(o => o.pickupStoreId === store.id).length
              return (
                <button
                  key={store.id}
                  onClick={() => setStoreFilter(store.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    storeFilter === store.id 
                      ? "bg-green-500 text-black" 
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  {store.name} ({storeOrderCount})
                </button>
              )
            })}
          </div>
        </div>
      )}

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
                ? "bg-white text-black" 
                : "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setFilter("PROCESSING")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "PROCESSING" 
                ? "bg-blue-500 text-white" 
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700"
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setFilter("OUT_FOR_DELIVERY")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "OUT_FOR_DELIVERY" 
                ? "bg-purple-500 text-white" 
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700"
            }`}
          >
            Out for Delivery
          </button>
          <button
            onClick={() => setFilter("PICKED_UP")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "PICKED_UP" 
                ? "bg-green-500 text-white" 
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700"
            }`}
          >
            Picked Up
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "COMPLETED" 
                ? "bg-green-600 text-white" 
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter("CANCELLED")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "CANCELLED" 
                ? "bg-red-500 text-white" 
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700"
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => setFilter("REFUNDED")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "REFUNDED" 
                ? "bg-orange-500 text-white" 
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 border border-zinc-700"
            }`}
          >
            Refunded
          </button>
        </div>
      </div>

      {/* Pagination Controls - Top */}
      {filteredOrders.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-primary"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="px-4 py-2 text-white font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
          {paginatedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-primary/50 transition-all"
            >
              {/* Order Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-xl font-bold text-white">#{order.orderNumber}</h3>
                    <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 text-gray-300">
                      {order.fulfillmentType}
                    </span>
                    {/* Payment Method Badge */}
                    {order.paymentReference === 'CASH_PAYMENT' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs font-bold text-orange-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Cash
                      </span>
                    ) : order.paymentReference ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-bold text-green-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Paid
                      </span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.user?.name || order.user?.email || 'Guest'}
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
                  ) : order.fulfillmentType === "DELIVERY" && order.deliveryStreet ? (
                    <>
                      <p className="text-white font-medium">Delivery Address:</p>
                      <p className="text-gray-300">{order.customerName}</p>
                      <p className="text-gray-400">{order.deliveryStreet}</p>
                      <p className="text-gray-400">
                        {order.deliveryCity}, {order.deliveryState} {order.deliveryZipCode}
                      </p>
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
              <div className="flex flex-wrap gap-2">
                {/* Customer Information Button */}
                <button
                  onClick={() => setCustomerInfoModal({ isOpen: true, order })}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold rounded-lg transition-all border border-zinc-700 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Customer Information
                </button>

                {/* Single Manage Order Button */}
                {order.status === "COMPLETED" ? (
                  <span className="px-4 py-2 bg-green-500/10 text-green-400 text-sm font-medium rounded-lg">
                    ✓ Order Completed
                  </span>
                ) : order.status === "CANCELLED" ? (
                  <span className="px-4 py-2 bg-red-500/10 text-red-400 text-sm font-medium rounded-lg">
                    ✗ Order Cancelled
                  </span>
                ) : order.status === "REFUNDED" ? (
                  <span className="px-4 py-2 bg-orange-500/10 text-orange-400 text-sm font-medium rounded-lg">
                    ↩ Order Refunded
                  </span>
                ) : (
                  <button
                    onClick={() => setActionModal({
                      isOpen: true,
                      orderId: order.id,
                      currentStatus: order.status,
                      fulfillmentType: order.fulfillmentType,
                      orderNumber: order.orderNumber
                    })}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:shadow-xl border border-blue-500"
                  >
                    Manage Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls - Bottom */}
      {filteredOrders.length > 0 && totalPages > 1 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-4 py-2 text-white font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Customer Information Modal */}
      {customerInfoModal.isOpen && customerInfoModal.order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/20">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Customer Information</h3>
                  <p className="text-sm text-gray-400">Order #{customerInfoModal.order.orderNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setCustomerInfoModal({ isOpen: false, order: null })}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Name</p>
                      <p className="text-white font-medium">{customerInfoModal.order.customerName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-white font-medium break-all">{customerInfoModal.order.customerEmail || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-white font-medium">{customerInfoModal.order.customerPhone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Order Details
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order Number:</span>
                    <span className="text-white font-bold">#{customerInfoModal.order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order Date:</span>
                    <span className="text-white">{new Date(customerInfoModal.order.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(customerInfoModal.order.status)}`}>
                      {customerInfoModal.order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fulfillment Type:</span>
                    <span className="text-white font-medium">{customerInfoModal.order.fulfillmentType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="text-white font-medium">
                      {customerInfoModal.order.paymentReference === 'CASH_PAYMENT' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full text-xs font-bold text-orange-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Cash on Pickup
                        </span>
                      ) : customerInfoModal.order.paymentReference ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-bold text-green-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Paid Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-500/20 border border-gray-500/30 rounded-full text-xs font-bold text-gray-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Unknown
                        </span>
                      )}
                    </span>
                  </div>
                  {customerInfoModal.order.paymentReference && customerInfoModal.order.paymentReference !== 'CASH_PAYMENT' && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Ref:</span>
                      <span className="text-white text-xs font-mono">{customerInfoModal.order.paymentReference}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-700">
                    <span className="text-gray-400">Total Amount:</span>
                    <span className="text-primary">R{customerInfoModal.order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery/Pickup Address */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {customerInfoModal.order.fulfillmentType === 'PICKUP' ? 'Pickup Location' : 'Delivery Address'}
                </h4>
                {customerInfoModal.order.fulfillmentType === 'PICKUP' && customerInfoModal.order.pickupStore ? (
                  <div className="space-y-1">
                    <p className="text-white font-medium">{customerInfoModal.order.pickupStore.name}</p>
                    <p className="text-gray-400">{customerInfoModal.order.pickupStore.city}</p>
                  </div>
                ) : customerInfoModal.order.deliveryStreet ? (
                  <div className="space-y-1">
                    <p className="text-white font-medium">{customerInfoModal.order.customerName}</p>
                    <p className="text-gray-400">{customerInfoModal.order.deliveryStreet}</p>
                    <p className="text-gray-400">
                      {customerInfoModal.order.deliveryCity}, {customerInfoModal.order.deliveryState} {customerInfoModal.order.deliveryZipCode}
                    </p>
                    {customerInfoModal.order.deliveryCountry && (
                      <p className="text-gray-400">{customerInfoModal.order.deliveryCountry}</p>
                    )}
                  </div>
                ) : customerInfoModal.order.shippingAddress ? (
                  <div className="space-y-1">
                    <p className="text-white font-medium">{customerInfoModal.order.shippingAddress.fullName}</p>
                    <p className="text-gray-400">{customerInfoModal.order.shippingAddress.street}</p>
                    <p className="text-gray-400">
                      {customerInfoModal.order.shippingAddress.city}, {customerInfoModal.order.shippingAddress.state} {customerInfoModal.order.shippingAddress.zipCode}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No address information available</p>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h4 className="text-sm font-bold text-primary mb-3">Order Items ({customerInfoModal.order.items.length})</h4>
                <div className="space-y-2">
                  {customerInfoModal.order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-zinc-900 rounded-lg">
                      {item.product.images[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{item.product.name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × R{item.price.toFixed(2)}</p>
                      </div>
                      <p className="text-white font-bold">R{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setCustomerInfoModal({ isOpen: false, order: null })}
              className="w-full mt-6 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Manage Order
              </h3>
            </div>

            <p className="text-gray-300 mb-2">
              Order <span className="font-bold text-primary">#{actionModal.orderNumber}</span>
            </p>
            
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Current Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(actionModal.currentStatus)}`}>
                  {actionModal.currentStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-400 font-medium">Available Actions:</p>
              
              {/* Next Status Button */}
              {getNextStatusLabel(actionModal.currentStatus, actionModal.fulfillmentType) && (
                <button
                  onClick={handleNextStatus}
                  disabled={isProcessing}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>{getNextStatusLabel(actionModal.currentStatus, actionModal.fulfillmentType)}</span>
                    </>
                  )}
                </button>
              )}

              {/* Cancel Order Button */}
              <button
                onClick={() => {
                  setActionModal({ isOpen: false, orderId: '', currentStatus: '', fulfillmentType: '', orderNumber: '' })
                  setConfirmModal({
                    isOpen: true,
                    orderId: actionModal.orderId,
                    action: 'cancel',
                    orderNumber: actionModal.orderNumber
                  })
                }}
                disabled={isProcessing}
                className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Cancel Order</span>
                <XCircle className="w-4 h-4" />
              </button>

              {/* Refund Order Button */}
              <button
                onClick={() => {
                  setActionModal({ isOpen: false, orderId: '', currentStatus: '', fulfillmentType: '', orderNumber: '' })
                  setConfirmModal({
                    isOpen: true,
                    orderId: actionModal.orderId,
                    action: 'refund',
                    orderNumber: actionModal.orderNumber
                  })
                }}
                disabled={isProcessing}
                className="w-full px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-medium rounded-lg transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Refund Order</span>
                <span className="text-xs">↩</span>
              </button>
            </div>

            <button
              onClick={() => setActionModal({ isOpen: false, orderId: '', currentStatus: '', fulfillmentType: '', orderNumber: '' })}
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-full ${
                confirmModal.action === 'cancel' 
                  ? 'bg-red-500/20' 
                  : 'bg-orange-500/20'
              }`}>
                <AlertTriangle className={`w-6 h-6 ${
                  confirmModal.action === 'cancel' 
                    ? 'text-red-400' 
                    : 'text-orange-400'
                }`} />
              </div>
              <h3 className="text-xl font-bold text-white">
                {confirmModal.action === 'cancel' ? 'Cancel Order' : 'Refund Order'}
              </h3>
            </div>

            <p className="text-gray-300 mb-2">
              Are you sure you want to {confirmModal.action} order{' '}
              <span className="font-bold text-primary">#{confirmModal.orderNumber}</span>?
            </p>
            
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-400">
                ⚠️ This action will restore the stock back to the store inventory.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ isOpen: false, orderId: '', action: null, orderNumber: '' })}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={`flex-1 px-4 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  confirmModal.action === 'cancel'
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                    : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  confirmModal.action === 'cancel' ? 'Cancel Order' : 'Refund Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
