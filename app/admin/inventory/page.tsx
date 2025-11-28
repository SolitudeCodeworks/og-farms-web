"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Package, Plus, AlertTriangle, Search, X, Edit3 } from "lucide-react"

interface InventoryItem {
  id: string
  product: {
    id: string
    name: string
    images: string[]
  }
  store: {
    id: string
    name: string
    city: string
  }
  quantity: number
  lowStockAlert: number
}

export default function InventoryPage() {
  const searchParams = useSearchParams()
  const storeFilter = searchParams.get('store')
  
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStore, setSelectedStore] = useState<string>(storeFilter || "")
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'set'>('add')
  const [adjustmentAmount, setAdjustmentAmount] = useState("")
  const [adjusting, setAdjusting] = useState(false)

  useEffect(() => {
    loadInventory()
  }, [])

  useEffect(() => {
    if (storeFilter) {
      setSelectedStore(storeFilter)
    }
  }, [storeFilter])

  const loadInventory = async () => {
    try {
      const response = await fetch("/api/admin/inventory")
      if (response.ok) {
        const data = await response.json()
        setInventory(data.inventory)
      }
    } catch (error) {
      console.error("Error loading inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const openAdjustModal = (item: InventoryItem) => {
    setSelectedItem(item)
    setAdjustmentType('add')
    setAdjustmentAmount("")
    setShowAdjustModal(true)
  }

  const handleAdjustStock = async () => {
    if (!selectedItem || !adjustmentAmount) return

    setAdjusting(true)

    try {
      const amount = parseInt(adjustmentAmount)
      let newQuantity = selectedItem.quantity

      if (adjustmentType === 'add') {
        newQuantity += amount
      } else if (adjustmentType === 'remove') {
        newQuantity = Math.max(0, newQuantity - amount)
      } else {
        newQuantity = amount
      }

      const response = await fetch(`/api/admin/inventory/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      })

      if (response.ok) {
        await loadInventory()
        setShowAdjustModal(false)
        setSelectedItem(null)
        setAdjustmentAmount("")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to adjust stock")
      }
    } catch (error) {
      console.error("Error adjusting stock:", error)
      alert("Failed to adjust stock")
    } finally {
      setAdjusting(false)
    }
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.store.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStore = !selectedStore || item.store.id === selectedStore
    return matchesSearch && matchesStore
  })

  const lowStockItems = inventory.filter(item => item.quantity <= item.lowStockAlert)
  
  const stores = Array.from(new Set(inventory.map(item => item.store.id)))
    .map(id => inventory.find(item => item.store.id === id)!.store)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <img 
            src="/images/weed-icon.png" 
            alt="Loading"
            className="w-16 h-16 animate-spin"
          />
          <p className="text-white text-lg">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
          <p className="text-gray-400">Manage stock levels across all stores</p>
        </div>
        <Link
          href="/admin/inventory/add"
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            color: '#000',
          }}
        >
          <Plus className="w-5 h-5" />
          Add Stock
        </Link>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-orange-500/20 border border-orange-500 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Low Stock Alert</h2>
          </div>
          <p className="text-orange-200">
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need restocking
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products or stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Store Filter */}
          <div className="flex gap-2">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name} - {store.city}
                </option>
              ))}
            </select>
            {selectedStore && (
              <button
                onClick={() => setSelectedStore("")}
                className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Clear filter"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedStore) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Active filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedStore && (
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm flex items-center gap-2">
                Store: {stores.find(s => s.id === selectedStore)?.name}
                <button onClick={() => setSelectedStore("")} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Inventory Table */}
      {filteredInventory.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No inventory found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm ? "Try a different search term" : "Start by adding stock to your stores"}
          </p>
          <Link
            href="/admin/inventory/add"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: '#000',
            }}
          >
            <Plus className="w-5 h-5" />
            Add Stock
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Store</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Stock</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.product.images[0] && (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <span className="text-white font-medium">{item.product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{item.store.name}</p>
                        <p className="text-sm text-gray-400">{item.store.city}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold text-lg">{item.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      {item.quantity <= item.lowStockAlert ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openAdjustModal(item)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                          color: '#000',
                          boxShadow: '0 2px 8px rgba(74, 222, 128, 0.3)',
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setShowAdjustModal(false)}
          />
          
          <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 border-2 rounded-3xl p-8 max-w-lg w-full shadow-2xl"
            style={{
              borderColor: 'rgba(74, 222, 128, 0.3)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74, 222, 128, 0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  }}
                >
                  <Edit3 className="w-6 h-6 text-black" />
                </div>
                <h2 className="text-3xl font-bold text-white">Adjust Stock</h2>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Product Info Card */}
            <div className="mb-8 p-6 bg-zinc-800/50 rounded-2xl border border-zinc-700">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-medium">Product</span>
                  <span className="text-white font-bold text-lg">{selectedItem.product.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-medium">Store Location</span>
                  <span className="text-white font-semibold">{selectedItem.store.name}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-zinc-700">
                  <span className="text-gray-400 text-sm font-medium">Current Stock</span>
                  <span className="text-3xl font-bold" style={{ color: '#4ade80' }}>{selectedItem.quantity}</span>
                </div>
              </div>
            </div>

            {/* Action Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-white mb-3">Select Action</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setAdjustmentType('add')}
                  className={`py-4 px-4 rounded-xl font-bold transition-all ${
                    adjustmentType === 'add' 
                      ? 'scale-105 shadow-lg' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: adjustmentType === 'add' 
                      ? 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' 
                      : '#27272a',
                    color: adjustmentType === 'add' ? '#000' : '#9ca3af',
                    boxShadow: adjustmentType === 'add' ? '0 4px 15px rgba(74, 222, 128, 0.4)' : 'none',
                  }}
                >
                  ➕ Add
                </button>
                <button
                  onClick={() => setAdjustmentType('remove')}
                  className={`py-4 px-4 rounded-xl font-bold transition-all ${
                    adjustmentType === 'remove' 
                      ? 'scale-105 shadow-lg' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: adjustmentType === 'remove' 
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                      : '#27272a',
                    color: adjustmentType === 'remove' ? '#fff' : '#9ca3af',
                    boxShadow: adjustmentType === 'remove' ? '0 4px 15px rgba(239, 68, 68, 0.4)' : 'none',
                  }}
                >
                  ➖ Remove
                </button>
                <button
                  onClick={() => setAdjustmentType('set')}
                  className={`py-4 px-4 rounded-xl font-bold transition-all ${
                    adjustmentType === 'set' 
                      ? 'scale-105 shadow-lg' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: adjustmentType === 'set' 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                      : '#27272a',
                    color: adjustmentType === 'set' ? '#fff' : '#9ca3af',
                    boxShadow: adjustmentType === 'set' ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none',
                  }}
                >
                  📝 Set
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-white mb-3">
                {adjustmentType === 'add' ? '➕ Amount to Add' : adjustmentType === 'remove' ? '➖ Amount to Remove' : '📝 Set New Quantity'}
              </label>
              <input
                type="number"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                min="0"
                className="w-full px-6 py-4 rounded-xl bg-zinc-800 border-2 border-zinc-700 text-white text-2xl font-bold focus:outline-none focus:border-primary transition-colors"
                placeholder="0"
                autoFocus
              />
              {adjustmentAmount && (
                <p className="mt-3 text-sm font-medium" style={{ color: '#4ade80' }}>
                  New stock will be: {
                    adjustmentType === 'add' 
                      ? selectedItem.quantity + parseInt(adjustmentAmount || '0')
                      : adjustmentType === 'remove'
                      ? Math.max(0, selectedItem.quantity - parseInt(adjustmentAmount || '0'))
                      : parseInt(adjustmentAmount || '0')
                  }
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 py-4 px-6 bg-zinc-700 hover:bg-zinc-600 text-white font-bold rounded-xl transition-all hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={!adjustmentAmount || adjusting}
                className="flex-1 py-4 px-6 rounded-xl font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background: (!adjustmentAmount || adjusting) ? '#3f3f46' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: (!adjustmentAmount || adjusting) ? '#71717a' : '#000',
                  boxShadow: (!adjustmentAmount || adjusting) ? 'none' : '0 4px 15px rgba(74, 222, 128, 0.4)',
                }}
              >
                {adjusting ? '⏳ Updating...' : '✓ Confirm Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
