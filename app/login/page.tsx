"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        // Fetch session to check user role
        const response = await fetch("/api/auth/session")
        const session = await response.json()
        
        // Redirect based on role
        if (session?.user?.role === "ADMIN") {
          router.push("/admin")
        } else {
          router.push("/")
        }
        router.refresh()
      }
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
          <h1 className="text-3xl font-bold text-black">Welcome Back</h1>
          <p className="text-gray-600">
            Sign in to your account to continue
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-bold text-gray-700">
                  Password *
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-white border text-black focus:outline-none focus:border-primary"
                style={{ borderColor: 'rgba(74, 222, 128, 0.3)' }}
              />
            </div>
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
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-bold">
                Create Account
              </Link>
            </p>
        </form>
      </div>
    </div>
  )
}
