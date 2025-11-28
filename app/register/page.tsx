"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Validation states
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters")
      return
    }

    if (!isValidEmail) {
      setError("Please enter a valid email address")
      return
    }

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      setError("Password does not meet requirements")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate date of birth
    if (!dateOfBirth) {
      setError("Please enter your date of birth")
      return
    }

    // Calculate age
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 18) {
      setError("You must be at least 18 years old to register")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          dateOfBirth,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      router.push("/login?registered=true")
    } catch (error) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
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
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-black">Create Account</h1>
          <p className="text-gray-600">
            Join us and start shopping premium cannabis
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
              <label htmlFor="name" className="text-sm font-bold text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-gray-700">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="dateOfBirth" className="text-sm font-bold text-gray-700">
                Date of Birth * <span className="text-xs font-normal text-gray-500">(Must be 18+)</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-bold text-gray-700">
                Password *
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
                Confirm Password *
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
            <p className="text-xs text-gray-500 pt-2">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              .
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full font-bold uppercase tracking-wide transition-all hover:scale-105 mt-6"
              style={{
                background: loading ? 'rgba(100, 100, 100, 0.3)' : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                color: loading ? '#666' : '#000',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(74, 222, 128, 0.4)',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-bold">
                Sign In
              </Link>
            </p>
        </form>
      </div>
    </div>
  )
}
