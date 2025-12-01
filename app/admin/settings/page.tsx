"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2, Shield, UserX, UserCheck, Search } from "lucide-react"

interface Setting {
  key: string
  value: string
  category: string
  description?: string
}

interface User {
  id: string
  email: string
  name: string | null
  role: "ADMIN" | "CUSTOMER"
  createdAt: string
  updatedAt: string
}

const SOCIAL_MEDIA_SETTINGS = [
  { key: "social_facebook", label: "Facebook URL", placeholder: "https://facebook.com/yourpage", description: "Your Facebook page URL" },
  { key: "social_instagram", label: "Instagram URL", placeholder: "https://instagram.com/yourpage", description: "Your Instagram profile URL" },
  { key: "social_twitter", label: "Twitter/X URL", placeholder: "https://twitter.com/yourpage", description: "Your Twitter/X profile URL" },
  { key: "social_tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@yourpage", description: "Your TikTok profile URL" },
  { key: "social_youtube", label: "YouTube URL", placeholder: "https://youtube.com/@yourpage", description: "Your YouTube channel URL" },
  { key: "social_linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/company/yourpage", description: "Your LinkedIn company page URL" },
]

const CONTACT_SETTINGS = [
  { key: "contact_email", label: "Contact Email", placeholder: "contact@ogfarms.com", description: "Main contact email address" },
  { key: "contact_phone", label: "Contact Phone", placeholder: "+27 123 456 7890", description: "Main contact phone number" },
  { key: "contact_whatsapp", label: "WhatsApp Number", placeholder: "+27 123 456 7890", description: "WhatsApp business number" },
]

const PRICING_SETTINGS = [
  { key: "delivery_fee", label: "Delivery Fee (R)", placeholder: "0", description: "Delivery fee charged for orders (set to 0 for free delivery)" },
]

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [admins, setAdmins] = useState<User[]>([])
  const [searchEmail, setSearchEmail] = useState("")
  const [searchedUser, setSearchedUser] = useState<User | null>(null)
  const [searching, setSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch settings
        const settingsResponse = await fetch("/api/admin/settings")
        if (settingsResponse.ok) {
          const data = await settingsResponse.json()
          const settingsMap: Record<string, string> = {}
          data.settings.forEach((setting: Setting) => {
            settingsMap[setting.key] = setting.value
          })
          setSettings(settingsMap)
        }

        // Fetch admins only
        const adminsResponse = await fetch("/api/admin/users")
        if (adminsResponse.ok) {
          const data = await adminsResponse.json()
          setAdmins(data.admins || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status])

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const settingsArray = Object.entries(settings).map(([key, value]) => {
        const socialSetting = SOCIAL_MEDIA_SETTINGS.find(s => s.key === key)
        const contactSetting = CONTACT_SETTINGS.find(s => s.key === key)
        
        return {
          key,
          value,
          category: socialSetting ? "social" : contactSetting ? "contact" : "general",
          description: socialSetting?.description || contactSetting?.description
        }
      })

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settingsArray })
      })

      if (response.ok) {
        setNotification({ type: 'success', message: 'Settings saved successfully!' })
        setTimeout(() => setNotification(null), 3000)
      } else {
        const data = await response.json()
        setNotification({ type: 'error', message: data.error || 'Failed to save settings' })
        setTimeout(() => setNotification(null), 5000)
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setNotification({ type: 'error', message: 'Failed to save settings' })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) {
      setNotification({ type: 'error', message: 'Please enter an email address' })
      setTimeout(() => setNotification(null), 3000)
      return
    }

    setSearching(true)
    setSearchedUser(null)

    try {
      const response = await fetch(`/api/admin/users?email=${encodeURIComponent(searchEmail.trim())}`)
      
      if (response.ok) {
        const data = await response.json()
        setSearchedUser(data.user)
      } else {
        const data = await response.json()
        setNotification({ type: 'error', message: data.error || 'User not found' })
        setTimeout(() => setNotification(null), 3000)
      }
    } catch (error) {
      console.error("Error searching user:", error)
      setNotification({ type: 'error', message: 'Failed to search user' })
      setTimeout(() => setNotification(null), 3000)
    } finally {
      setSearching(false)
    }
  }

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "CUSTOMER" : "ADMIN"
    setUpdatingUserId(userId)

    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (response.ok) {
        // Update local state
        if (newRole === "ADMIN") {
          // Add to admins list if promoted
          if (searchedUser && searchedUser.id === userId) {
            setAdmins(prev => [...prev, { ...searchedUser, role: "ADMIN" }])
            setSearchedUser(null)
            setSearchEmail("")
          }
        } else {
          // Remove from admins list if demoted
          setAdmins(prev => prev.filter(admin => admin.id !== userId))
        }
        
        setNotification({ 
          type: 'success', 
          message: `User ${newRole === "ADMIN" ? "promoted to" : "removed from"} admin successfully!` 
        })
        setTimeout(() => setNotification(null), 3000)
      } else {
        const data = await response.json()
        setNotification({ type: 'error', message: data.error || 'Failed to update user role' })
        setTimeout(() => setNotification(null), 5000)
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      setNotification({ type: 'error', message: 'Failed to update user role' })
      setTimeout(() => setNotification(null), 5000)
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {/* Toast Notification */}
      {notification && (
        <div 
          className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300"
          style={{
            animation: 'slideInFromTop 0.3s ease-out'
          }}
        >
          <div 
            className={`px-6 py-4 rounded-lg shadow-2xl border-2 ${
              notification.type === 'success' 
                ? 'bg-green-900/90 border-green-500 text-green-100' 
                : 'bg-red-900/90 border-red-500 text-red-100'
            }`}
            style={{
              backdropFilter: 'blur(10px)',
              minWidth: '300px'
            }}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <p className="font-semibold">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Site Settings</h1>
        <p className="text-gray-400">
          Manage your website's social media links and contact information
        </p>
      </div>

      <div className="space-y-6">
        {/* Social Media Settings */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Social Media Links</CardTitle>
            <CardDescription className="text-gray-400">
              Update your social media profile URLs. These will appear in the footer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {SOCIAL_MEDIA_SETTINGS.map(({ key, label, placeholder, description }) => (
              <div key={key} className="space-y-2">
                <label htmlFor={key} className="text-sm font-medium text-white">
                  {label}
                </label>
                <Input
                  id={key}
                  type="url"
                  placeholder={placeholder}
                  value={settings[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                />
                {description && (
                  <p className="text-sm text-gray-500">{description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Contact Information</CardTitle>
            <CardDescription className="text-gray-400">
              Update your contact details displayed on the website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CONTACT_SETTINGS.map(({ key, label, placeholder, description }) => (
              <div key={key} className="space-y-2">
                <label htmlFor={key} className="text-sm font-medium text-white">
                  {label}
                </label>
                <Input
                  id={key}
                  type={key === "contact_email" ? "email" : "text"}
                  placeholder={placeholder}
                  value={settings[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                />
                {description && (
                  <p className="text-sm text-gray-500">{description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Pricing Settings</CardTitle>
            <CardDescription className="text-gray-400">
              Configure pricing options for your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {PRICING_SETTINGS.map(({ key, label, placeholder, description }) => (
              <div key={key} className="space-y-2">
                <label htmlFor={key} className="text-sm font-medium text-white">
                  {label}
                </label>
                <Input
                  id={key}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={placeholder}
                  value={settings[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                />
                {description && (
                  <p className="text-sm text-gray-500">{description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Admin Management */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Admin Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              View current admins and search for users by email to promote them to admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Search for User */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-3">
                  Promote User to Admin
                </h3>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="Enter user email address..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                      className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500 h-11"
                    />
                  </div>
                  <Button
                    onClick={handleSearchUser}
                    disabled={searching || !searchEmail.trim()}
                    size="lg"
                    className="font-bold px-8 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                      color: '#000',
                      boxShadow: '0 4px 12px rgba(74, 222, 128, 0.3)',
                    }}
                  >
                    {searching ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        Search User
                      </>
                    )}
                  </Button>
                </div>

                {/* Search Result */}
                {searchedUser && (
                  <div className="mt-4 p-4 rounded-lg bg-zinc-800 border border-zinc-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{searchedUser.name || "No Name"}</p>
                          {searchedUser.role === "ADMIN" && (
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/20 text-primary">
                              ALREADY ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{searchedUser.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {new Date(searchedUser.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {searchedUser.role === "CUSTOMER" && (
                        <Button
                          onClick={() => handleToggleAdmin(searchedUser.id, searchedUser.role)}
                          disabled={updatingUserId === searchedUser.id}
                          variant="outline"
                          size="sm"
                          className="border-primary/50 text-primary hover:bg-primary/10"
                        >
                          {updatingUserId === searchedUser.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Make Admin
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Admins List */}
              <div>
                <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Current Administrators ({admins.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {admins.map(admin => (
                    <div 
                      key={admin.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-zinc-800 border border-primary/20"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{admin.name || "No Name"}</p>
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/20 text-primary">
                            ADMIN
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">{admin.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {new Date(admin.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleToggleAdmin(admin.id, admin.role)}
                        disabled={updatingUserId === admin.id}
                        variant="outline"
                        size="sm"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        {updatingUserId === admin.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <UserX className="h-4 w-4 mr-2" />
                            Remove Admin
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                  {admins.length === 0 && (
                    <p className="text-gray-500 text-sm italic p-4 text-center">No administrators found</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button - Sticky at bottom */}
        <div className="sticky bottom-0 bg-zinc-900 border-t-2 border-primary/30 p-6 -mx-6 -mb-6 mt-8 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-300">
              Changes will be reflected on the website immediately after saving
            </p>
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#000',
                boxShadow: '0 2px 8px rgba(74, 222, 128, 0.2)',
              }}
              className="min-w-[200px] font-bold text-lg hover:opacity-90 transition-opacity"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save All Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
