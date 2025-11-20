"use client"

import Link from "next/link"
import { ShoppingCart, User, Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { CartDropdown } from "@/components/cart/cart-dropdown"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { totalItems } = useCart()

  const navigation = [
    { name: "Shop", href: "/shop" },
    { name: "Flower", href: "/shop?category=FLOWER" },
    { name: "Accessories", href: "/shop?category=ACCESSORIES" },
    { name: "About", href: "/about" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-2xl font-bold text-primary">OG Farms</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
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
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/account">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
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
        <div className="lg:hidden">
          <div className="space-y-2 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
