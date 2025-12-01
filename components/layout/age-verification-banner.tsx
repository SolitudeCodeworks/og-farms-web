"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ShieldCheck, X } from "lucide-react"

export function AgeVerificationBanner() {
  const { data: session } = useSession()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user dismissed the banner
    const dismissed = localStorage.getItem('ageVerificationBannerDismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
      return
    }

    // Show banner if not logged in
    if (!session) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [session])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('ageVerificationBannerDismissed', 'true')
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 border-b border-primary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3 flex-1">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
            <p className="text-sm text-white">
              <span className="font-semibold">Age Verification Required:</span>{" "}
              To view our full range of THC products, please{" "}
              <Link 
                href="/login" 
                className="underline font-bold text-primary hover:text-primary/80 transition-colors"
              >
                login
              </Link>{" "}
              or{" "}
              <Link 
                href="/register" 
                className="underline font-bold text-primary hover:text-primary/80 transition-colors"
              >
                create an account
              </Link>{" "}
              to verify your age.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
