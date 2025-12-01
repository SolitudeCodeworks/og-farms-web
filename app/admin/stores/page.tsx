"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Store as StoreIcon, Plus, MapPin, Phone, Mail, Edit, Trash2, Power } from "lucide-react"

interface Store {
  id: string
  name: string
  slug: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email?: string
  isActive: boolean
  allowsPickup: boolean
  _count?: {
    inventory: number
    orders: number
  }
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; storeId: string | null; storeName: string }>({ 
    isOpen: false, 
    storeId: null, 
    storeName: '' 
  })

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    try {
      const response = await fetch("/api/admin/stores")
      if (response.ok) {
        const data = await response.json()
        setStores(data.stores)
      }
    } catch (error) {
      console.error("Error loading stores:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStoreStatus = async (storeId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/stores/${storeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        loadStores()
      }
    } catch (error) {
      console.error("Error toggling store status:", error)
    }
  }

  const openDeleteModal = (storeId: string, storeName: string) => {
    setDeleteModal({ isOpen: true, storeId, storeName })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, storeId: null, storeName: '' })
  }

  const confirmDelete = async () => {
    if (!deleteModal.storeId) return

    try {
      const response = await fetch(`/api/admin/stores/${deleteModal.storeId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        loadStores()
        closeDeleteModal()
      } else {
        const data = await response.json()
        alert(data.error || "Failed to delete store")
      }
    } catch (error) {
      console.error("Error deleting store:", error)
      alert("Failed to delete store")
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
          <p className="text-white text-lg">Loading stores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Stores</h1>
          <p className="text-gray-400">Manage your store locations</p>
        </div>
        <Link
          href="/admin/stores/new"
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            color: '#000',
          }}
        >
          <Plus className="w-5 h-5" />
          Add Store
        </Link>
      </div>

      {/* Stores Grid */}
      {stores.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <StoreIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No stores yet</h3>
          <p className="text-gray-400 mb-6">Get started by adding your first store location</p>
          <Link
            href="/admin/stores/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: '#000',
            }}
          >
            <Plus className="w-5 h-5" />
            Add Your First Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-primary/50 transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{store.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      store.isActive 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {store.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">/{store.slug}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStoreStatus(store.id, store.isActive)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    title={store.isActive ? "Deactivate" : "Activate"}
                  >
                    <Power className={`w-5 h-5 ${store.isActive ? 'text-green-400' : 'text-gray-400'}`} />
                  </button>
                  <Link
                    href={`/admin/stores/${store.id}/edit`}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Edit className="w-5 h-5 text-gray-400 hover:text-white" />
                  </Link>
                  <button
                    onClick={() => openDeleteModal(store.id, store.name)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div className="text-gray-300">
                    <p>{store.address}</p>
                    <p>{store.city}, {store.state} {store.zipCode}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="text-gray-300">{store.phone}</span>
                </div>
                
                {store.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-gray-300">{store.email}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">{store._count?.inventory || 0}</p>
                  <p className="text-xs text-gray-400">Products in stock</p>
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white">{store._count?.orders || 0}</p>
                  <p className="text-xs text-gray-400">Orders</p>
                </div>
                <div className="flex-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    store.allowsPickup 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {store.allowsPickup ? 'Pickup Available' : 'No Pickup'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Link
                  href={`/admin/inventory?store=${store.id}`}
                  className="flex-1 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                >
                  Manage Inventory
                </Link>
                <Link
                  href={`/admin/stores/${store.id}`}
                  className="flex-1 py-2 px-4 bg-primary/20 hover:bg-primary/30 text-primary text-sm font-medium rounded-lg transition-colors text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-red-500/20 rounded-full">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Delete Store</h3>
                <p className="text-gray-400">
                  Are you sure you want to delete <span className="font-semibold text-white">{deleteModal.storeName}</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Store
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
