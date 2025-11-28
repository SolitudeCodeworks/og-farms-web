"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, MapPin, Plus, Edit2, Trash2, Check, X } from "lucide-react"

interface Address {
  id: string
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
  isDefault: boolean
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  
  // User info state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "South Africa",
    phone: "",
    isDefault: false,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      loadAccountData()
    }
  }, [status, router])

  const loadAccountData = async () => {
    try {
      const response = await fetch("/api/account")
      if (response.ok) {
        const data = await response.json()
        console.log("Account data:", data) // Debug log
        setName(data.user.name || "")
        setEmail(data.user.email || "")
        setPhone(data.user.phone || "")
        setAddresses(data.addresses || [])
      } else {
        console.error("Failed to load account data:", response.status)
      }
    } catch (error) {
      console.error("Error loading account data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/account/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      })

      if (response.ok) {
        alert("Profile updated successfully!")
      } else {
        alert("Failed to update profile")
      }
    } catch (error) {
      alert("Error updating profile")
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingAddress 
        ? `/api/account/addresses/${editingAddress.id}`
        : "/api/account/addresses"
      
      const method = editingAddress ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      })

      if (response.ok) {
        await loadAccountData()
        setShowAddressForm(false)
        setEditingAddress(null)
        setAddressForm({
          fullName: "",
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "South Africa",
          phone: "",
          isDefault: false,
        })
      } else {
        alert("Failed to save address")
      }
    } catch (error) {
      alert("Error saving address")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadAccountData()
      } else {
        alert("Failed to delete address")
      }
    } catch (error) {
      alert("Error deleting address")
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone,
      isDefault: address.isDefault,
    })
    setShowAddressForm(true)
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
          <p className="text-white text-xl font-bold">Loading your account...</p>
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
        <h1 className="text-4xl font-bold text-white mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Information */}
          <div 
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(74, 222, 128, 0.5)',
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-black">Profile Information</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                  style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-4 py-3 rounded-lg bg-gray-100 border text-gray-500 cursor-not-allowed"
                  style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27 XX XXX XXXX"
                  className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                  style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105"
                style={{
                  background: saving ? 'rgba(100, 100, 100, 0.3)' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: saving ? '#666' : '#000',
                  boxShadow: saving ? 'none' : '0 4px 20px rgba(74, 222, 128, 0.4)',
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? "Saving..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* Saved Addresses */}
          <div 
            className="p-6 rounded-2xl border"
            style={{
              backgroundColor: '#ffffff',
              borderColor: 'rgba(74, 222, 128, 0.5)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-black">Saved Addresses</h2>
              </div>
              <button
                onClick={() => {
                  setEditingAddress(null)
                  setAddressForm({
                    fullName: "",
                    street: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "South Africa",
                    phone: "",
                    isDefault: false,
                  })
                  setShowAddressForm(true)
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: '#000',
                }}
              >
                <Plus className="h-4 w-4" />
                Add New
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No saved addresses yet</p>
                <p className="text-sm">Add an address for faster checkout</p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 rounded-lg border relative"
                    style={{
                      backgroundColor: address.isDefault ? 'rgba(74, 222, 128, 0.1)' : '#f9fafb',
                      borderColor: address.isDefault ? 'rgba(74, 222, 128, 0.5)' : '#e5e7eb',
                    }}
                  >
                    {address.isDefault && (
                      <span className="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full bg-primary text-black">
                        Default
                      </span>
                    )}
                    <p className="font-bold text-black">{address.fullName}</p>
                    <p className="text-sm text-gray-600">{address.street}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">{address.country}</p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditAddress(address)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Edit2 className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Address Form Modal */}
        {showAddressForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div 
              className="w-full max-w-2xl p-6 rounded-2xl border max-h-[90vh] overflow-y-auto"
              style={{
                backgroundColor: '#ffffff',
                borderColor: 'rgba(74, 222, 128, 0.5)',
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-black">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>
                <button
                  onClick={() => {
                    setShowAddressForm(false)
                    setEditingAddress(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                      style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                      style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                    style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                      style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Province *
                    </label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                      style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                      style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Set as default address
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false)
                      setEditingAddress(null)
                    }}
                    className="flex-1 py-3 rounded-full font-bold border-2 transition-all"
                    style={{
                      borderColor: '#4ade80',
                      color: '#000',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105"
                    style={{
                      background: saving ? 'rgba(100, 100, 100, 0.3)' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                      color: saving ? '#666' : '#000',
                      boxShadow: saving ? 'none' : '0 4px 20px rgba(74, 222, 128, 0.4)',
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {saving ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
