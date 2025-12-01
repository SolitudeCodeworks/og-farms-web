"use client"

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function AgeVerification() {
  const [showModal, setShowModal] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Check if user has already verified their age
    const ageVerified = localStorage.getItem('ageVerified')
    
    if (!ageVerified) {
      // Small delay to ensure smooth appearance
      setTimeout(() => setShowModal(true), 500)
    }
  }, [])

  const handleConfirm = () => {
    // Save to localStorage that user is 18+
    localStorage.setItem('ageVerified', 'true')
    localStorage.setItem('ageVerifiedDate', new Date().toISOString())
    setShowModal(false)
  }

  const handleDecline = () => {
    // Show exit animation
    setIsExiting(true)
    
    // Redirect to a "not allowed" page or external site after animation
    setTimeout(() => {
      // You can change this to any URL you prefer
      window.location.href = 'https://www.google.com'
    }, 1000)
  }

  if (!showModal) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Background with cannabis leaf pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(/images/weed-icon.png)',
          backgroundSize: '100px',
          backgroundRepeat: 'repeat',
        }}
      />

      <div 
        className={`relative max-w-md w-full rounded-2xl border-2 p-8 text-center transform transition-all duration-500 ${
          isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          backgroundColor: '#000000',
          borderColor: '#4ade80',
          boxShadow: '0 0 40px rgba(74, 222, 128, 0.3)',
        }}
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <img 
            src="/images/weed-icon.png" 
            alt="OG Farms"
            className="w-20 h-20 animate-pulse"
          />
        </div>

        {/* Title */}
        <h2 
          className="text-3xl font-bold mb-4"
          style={{ color: '#4ade80' }}
        >
          Age Verification Required
        </h2>

        {/* Message */}
        <p className="text-gray-300 text-lg mb-2">
          You must be 18 years or older to enter this site.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          By entering, you confirm that you are of legal age in your jurisdiction.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleConfirm}
            className="flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: '#000',
              boxShadow: '0 4px 20px rgba(74, 222, 128, 0.4)',
            }}
          >
            I'm 18 or Older
          </button>
          
          <button
            onClick={handleDecline}
            className="flex-1 py-4 px-6 rounded-xl font-bold text-lg border-2 transition-all hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#ef4444',
              color: '#ef4444',
            }}
          >
            I'm Under 18
          </button>
        </div>

        {/* Legal Notice */}
        <p className="text-gray-500 text-xs mt-6">
          This website contains age-restricted materials. By entering, you agree to our terms and conditions.
        </p>
      </div>

      {/* Exit message overlay */}
      {isExiting && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <X className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" />
            <p className="text-white text-2xl font-bold">
              Sorry, you must be 18 or older to access this site.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
