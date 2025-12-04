"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ShoppingCart, Heart, User, Menu, X, Search, LogOut, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartDropdown } from "@/components/cart/cart-dropdown"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { data: session, status } = useSession()
  const [cartCount, setCartCount] = useState(0)

  // Load cart count from localStorage (fast, no DB calls)
  useEffect(() => {
    const updateCartCount = () => {
      // Always read from localStorage for fast display
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
      setCartCount(count)
    }

    updateCartCount()
    window.addEventListener('cartUpdated', updateCartCount)
    
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [session])

  const totalItems = cartCount

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800" style={{ backgroundColor: 'rgba(0, 0, 0, 0.98)' }}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 group">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-[#9EFF00] blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <span className="relative text-3xl font-bold tracking-wider bg-gradient-to-r from-[#9EFF00] to-[#7FD000] bg-clip-text text-transparent uppercase">
                  OG
                </span>
              </div>
              <span className="text-3xl font-bold tracking-wider text-white group-hover:text-[#9EFF00] transition-colors uppercase">
                FARMS
              </span>
            </div>
          </Link>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Favourites */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/favourites">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Favourites</span>
            </Link>
          </Button>

          {/* Mobile Cart */}
          <Button variant="ghost" size="icon" asChild className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span 
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    color: '#000',
                  }}
                >
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Link>
          </Button>

          {/* Mobile User */}
          {session ? (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/account">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    color: '#000',
                  }}
                >
                  {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link href="/login">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href === '/shop' && pathname?.startsWith('/products'))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-semibold leading-6 transition-colors relative ${
                  isActive 
                    ? 'text-green-400' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-400 rounded-full" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right side actions */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          
          {/* User Menu */}
          {status === "loading" ? (
            <Button variant="ghost" size="icon" disabled>
              <User className="h-5 w-5 animate-pulse" />
            </Button>
          ) : session ? (
            // Show Dashboard button for admins, dropdown for regular users
            session.user?.role === "ADMIN" ? (
              <Button 
                asChild
                className="font-bold"
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: '#000',
                }}
              >
                <Link href="/admin">
                  Admin Dashboard
                </Link>
              </Button>
            ) : (
              <div 
                className="relative"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <Button variant="ghost" size="icon" className="relative">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        color: '#000',
                      }}
                    >
                      {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                </Button>
                
                {/* User Dropdown */}
                {userMenuOpen && (
                  <div 
                    className="absolute right-0 top-full pt-2 z-50 min-w-[200px]"
                  >
                    <div
                      className="rounded-xl shadow-2xl border p-2"
                      style={{
                        backgroundColor: '#ffffff',
                        borderColor: 'rgba(74, 222, 128, 0.5)',
                      }}
                    >
                      <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(74, 222, 128, 0.2)' }}>
                        <p className="text-sm font-bold text-black">{session.user?.name}</p>
                        <p className="text-xs text-gray-600">{session.user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link 
                          href="/account"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-black hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <User className="h-4 w-4" />
                          My Account
                        </Link>
                        <Link 
                          href="/orders"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-black hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="font-semibold">
                  Sign In
                </Link>
              </Button>
              <Button 
                size="sm" 
                asChild
                className="font-bold"
                style={{
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: '#000',
                }}
              >
                <Link href="/register">
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
          
          {/* Favourites Icon */}
          <Button variant="ghost" size="icon" asChild>
            <Link href="/favourites">
              <Heart className="h-5 w-5" />
              <span className="sr-only">Favourites</span>
            </Link>
          </Button>

          <div 
            className="relative"
            onMouseEnter={() => setCartOpen(true)}
            onMouseLeave={() => setCartOpen(false)}
          >
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span 
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    color: '#000',
                  }}
                >
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
            
            {/* Cart Dropdown */}
            {cartOpen && (
              <div 
                className="absolute right-0 top-full pt-2 z-50"
              >
                <div
                  className="rounded-2xl shadow-2xl border"
                  style={{
                    backgroundColor: 'rgba(10, 10, 10, 0.98)',
                    borderColor: 'rgba(74, 222, 128, 0.4)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(74, 222, 128, 0.2)',
                  }}
                >
                  <CartDropdown />
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.98)',
          backdropFilter: 'blur(10px)',
        }}>
          <div className="space-y-2 px-4 pb-3 pt-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                             (item.href === '/shop' && pathname?.startsWith('/products'))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block rounded-lg px-3 py-2 text-base font-semibold leading-7 transition-colors ${
                    isActive 
                      ? 'text-green-400 bg-green-400/10' 
                      : 'text-white hover:bg-zinc-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              )
            })}
            
            {/* Quick Links for logged-in users */}
            {session && (
              <>
                <Link
                  href="/account"
                  className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-zinc-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <Link
                  href="/orders"
                  className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-white hover:bg-zinc-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                {session.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-primary hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            )}

            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t" style={{ borderColor: 'rgba(74, 222, 128, 0.2)' }}>
              {session ? (
                <>
                  <div className="px-3 py-2 text-sm rounded-lg" style={{ backgroundColor: 'rgba(74, 222, 128, 0.1)' }}>
                    <p className="font-bold text-white">{session.user?.name}</p>
                    <p className="text-xs text-gray-400">{session.user?.email}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: '/' })
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button 
                      variant="outline" 
                      className="w-full border-zinc-700 text-white hover:bg-zinc-800"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full"
                  >
                    <Button 
                      className="w-full font-bold"
                      style={{
                        background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                        color: '#000',
                      }}
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
