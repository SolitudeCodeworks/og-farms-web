"use client"

import { useEffect, useState } from "react"
import { Store, Package, ShoppingCart, TrendingUp, AlertTriangle, Users } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalStores: number
  activeStores: number
  totalProducts: number
  lowStockItems: number
  pendingOrders: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/images/weed-icon.png" 
            alt="Loading"
            className="w-16 h-16 animate-spin"
          />
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Stores",
      value: stats?.totalStores || 0,
      subtitle: `${stats?.activeStores || 0} active`,
      icon: Store,
      color: "from-green-500 to-emerald-600",
      href: "/admin/stores"
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      subtitle: `${stats?.totalOrders || 0} total orders`,
      icon: ShoppingCart,
      color: "from-purple-500 to-pink-600",
      href: "/admin/orders"
    },
    {
      title: "Low Stock Items",
      value: stats?.lowStockItems || 0,
      subtitle: "Need restocking",
      icon: AlertTriangle,
      color: "from-orange-500 to-red-600",
      href: "/admin/inventory"
    },
    {
      title: "Total Revenue",
      value: `R${(stats?.totalRevenue || 0).toLocaleString()}`,
      subtitle: "All time sales",
      icon: TrendingUp,
      color: "from-green-500 to-teal-600",
      href: "/admin/orders"
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome to OG Farms Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 p-6 hover:border-primary/50 transition-all hover:scale-105"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              {/* Content */}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-1">
                  {card.value}
                </h3>
                <p className="text-sm font-medium text-gray-400 mb-1">
                  {card.title}
                </p>
                <p className="text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/stores/new"
            className="flex items-center gap-3 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <Store className="w-5 h-5 text-primary" />
            <span className="text-white font-medium">Add New Store</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="flex items-center gap-3 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <Package className="w-5 h-5 text-primary" />
            <span className="text-white font-medium">Manage Stock</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-primary" />
            <span className="text-white font-medium">View Orders</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
