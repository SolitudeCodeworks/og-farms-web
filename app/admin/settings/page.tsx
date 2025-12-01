"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2 } from "lucide-react"

interface Setting {
  key: string
  value: string
  category: string
  description?: string
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings")
        if (response.ok) {
          const data = await response.json()
          const settingsMap: Record<string, string> = {}
          data.settings.forEach((setting: Setting) => {
            settingsMap[setting.key] = setting.value
          })
          setSettings(settingsMap)
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchSettings()
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
