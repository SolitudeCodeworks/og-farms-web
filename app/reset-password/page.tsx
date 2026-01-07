"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Check, X } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password validation states
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid or missing reset token")
        setValidating(false)
        return
      }

      try {
        const response = await fetch("/api/auth/validate-reset-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setTokenValid(true)
        } else {
          setError(data.error || "Invalid or expired reset token")
        }
      } catch (error) {
        setError("Failed to validate reset token")
      } finally {
        setValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate password requirements
    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      setError("Password does not meet requirements")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to reset password")
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 bg-black overflow-hidden">
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
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        <div className="relative z-10 text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Validating reset token...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12 bg-black overflow-hidden">
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
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      
      {/* Content */}
      <div 
        className="relative z-10 w-full max-w-md p-8 rounded-2xl border"
        style={{
          backgroundColor: '#ffffff',
          borderColor: 'rgba(74, 222, 128, 0.5)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {!tokenValid ? (
          <div>
            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-bold text-black">Invalid Link</h1>
              <p className="text-gray-600">
                This password reset link is invalid or has expired.
              </p>
            </div>
            <div 
              className="rounded-lg p-4 border border-red-400 bg-red-50 mb-6"
            >
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <Link
              href="/forgot-password"
              className="block w-full py-4 rounded-full font-bold uppercase tracking-wide text-center transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: '#000',
                boxShadow: '0 4px 20px rgba(74, 222, 128, 0.4)',
              }}
            >
              Request New Link
            </Link>
          </div>
        ) : success ? (
          <div>
            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-bold text-black">Password Reset!</h1>
              <p className="text-gray-600">
                Your password has been successfully reset.
              </p>
            </div>
            <div 
              className="rounded-lg p-4 border border-green-400 bg-green-50 mb-6"
            >
              <p className="text-sm font-medium text-green-800">
                Redirecting you to login page...
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-2 mb-6">
              <h1 className="text-3xl font-bold text-black">Create New Password</h1>
              <p className="text-gray-600">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div 
                  className="rounded-lg p-4 border border-red-400 bg-red-50"
                >
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-bold text-gray-700">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                    style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-xs">
                      {hasMinLength ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-gray-400" />}
                      <span className={hasMinLength ? "text-green-600" : "text-gray-500"}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {hasUpperCase ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-gray-400" />}
                      <span className={hasUpperCase ? "text-green-600" : "text-gray-500"}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {hasLowerCase ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-gray-400" />}
                      <span className={hasLowerCase ? "text-green-600" : "text-gray-500"}>One lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {hasNumber ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-gray-400" />}
                      <span className={hasNumber ? "text-green-600" : "text-gray-500"}>One number</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                    style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword.length > 0 && (
                  <div className="flex items-center gap-2 text-xs mt-1">
                    {passwordsMatch ? (
                      <>
                        <Check className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !passwordsMatch}
                className="w-full py-4 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105 mt-6"
                style={{
                  background: (loading || !hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !passwordsMatch) 
                    ? 'rgba(100, 100, 100, 0.3)' 
                    : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: (loading || !hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !passwordsMatch) 
                    ? '#666' 
                    : '#000',
                  boxShadow: (loading || !hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !passwordsMatch) 
                    ? 'none' 
                    : '0 4px 20px rgba(74, 222, 128, 0.4)',
                  cursor: (loading || !hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber || !passwordsMatch) 
                    ? 'not-allowed' 
                    : 'pointer',
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                Remember your password?{" "}
                <Link href="/login" className="text-primary hover:underline font-bold">
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 bg-black overflow-hidden">
        <div className="relative z-10 text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
