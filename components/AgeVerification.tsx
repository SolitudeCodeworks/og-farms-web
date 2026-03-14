"use client"

import { useState, useEffect } from 'react'
import { X, UserPlus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AgeVerification() {
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState<'age' | 'register'>('age')
  const [isExiting, setIsExiting] = useState(false)
  
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Wait for session to load before making decisions that depend on auth state
    if (status === 'loading') return;

    const ageVerified = localStorage.getItem('ageVerified')
    const registrationPromptDismissed = localStorage.getItem('registrationPromptDismissed')
    
    if (!ageVerified) {
      // Step 1: Age Verification
      setTimeout(() => setShowModal(true), 500)
    } else if (!registrationPromptDismissed && status === 'unauthenticated') {
      // Step 2: Registration Prompt if already age verified but hasn't dismissed prompt
      setStep('register')
      setTimeout(() => setShowModal(true), 500)
    }
  }, [status])

  const handleConfirmAge = () => {
    // Save to localStorage that user confirmed they are 18+
    localStorage.setItem('ageVerified', 'true')
    localStorage.setItem('ageVerifiedDate', new Date().toISOString())
    
    if (status === 'unauthenticated') {
      // Move to registration prompt if not logged in
      setStep('register')
    } else {
      setShowModal(false)
    }
  }

  const handleDeclineAge = () => {
    // Show exit animation
    setIsExiting(true)
    
    // Redirect to a "not allowed" page or external site after animation
    setTimeout(() => {
      window.location.href = 'https://www.google.com'
    }, 1000)
  }

  const handleDismissRegister = () => {
    localStorage.setItem('registrationPromptDismissed', 'true')
    setShowModal(false)
  }
  
  const handleRegisterClick = () => {
    localStorage.setItem('registrationPromptDismissed', 'true')
    setShowModal(false)
    router.push('/register')
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
          borderColor: step === 'register' ? '#3b82f6' : '#4ade80',
          boxShadow: step === 'register' ? '0 0 40px rgba(59, 130, 246, 0.3)' : '0 0 40px rgba(74, 222, 128, 0.3)',
        }}
      >
        {step === 'age' ? (
          <>
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
                onClick={handleConfirmAge}
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
                onClick={handleDeclineAge}
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
          </>
        ) : (
          <>
            {/* Registration Prompt */}
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.5)',
                }}
              >
                <UserPlus className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold mb-4 text-blue-400">
              Create an Account
            </h2>

            {/* Message */}
            <p className="text-gray-300 text-lg mb-2">
              You must be registered and verify your age to purchase 18+ items.
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Want to set up your account now to unlock all products? We'll only ask once.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRegisterClick}
                className="flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: '#fff',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                }}
              >
                Register Now
              </button>
              
              <button
                onClick={handleDismissRegister}
                className="flex-1 py-4 px-6 rounded-xl font-bold text-lg border-2 transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#6b7280',
                  color: '#9ca3af',
                }}
              >
                Maybe Later
              </button>
            </div>
          </>
        )}
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
