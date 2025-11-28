"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { X, Calendar } from "lucide-react"

interface AgeVerificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AgeVerificationModal({ isOpen, onClose }: AgeVerificationModalProps) {
  const router = useRouter()
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Calculate age
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (age < 18) {
        setError("You must be 18 or older to access this site")
        setLoading(false)
        return
      }

      // Submit to API
      const response = await fetch("/api/auth/verify-age", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dateOfBirth }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Verification failed")
        return
      }

      // Success - refresh and close
      router.refresh()
      onClose()
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md p-8 rounded-2xl border"
        style={{
          backgroundColor: '#ffffff',
          borderColor: 'rgba(74, 222, 128, 0.5)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
            }}
          >
            <Calendar className="h-8 w-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-black">Age Verification Required</h2>
          <p className="text-gray-600 mt-2">
            You must be 18 or older to purchase cannabis products in South Africa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg p-4 border border-red-400 bg-red-50">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="text-sm font-bold text-gray-700">
              Date of Birth *
            </label>
            <input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
              style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
            />
            <p className="text-xs text-gray-500">
              We need to verify you are 18+ to comply with South African law
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105"
            style={{
              background: loading ? 'rgba(100, 100, 100, 0.3)' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: loading ? '#666' : '#000',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(74, 222, 128, 0.4)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? "Verifying..." : "Verify Age"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Your information is kept private and secure
          </p>
        </form>
      </div>
    </div>
  )
}
