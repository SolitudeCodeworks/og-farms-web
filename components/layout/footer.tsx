"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Facebook, Instagram, Phone, Twitter, Youtube, Linkedin, MessageCircle } from "lucide-react"
import { FaTiktok } from "react-icons/fa"

interface SocialLink {
  key: string
  value: string
  platform: string
  icon: React.ReactNode
}

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [contactPhone, setContactPhone] = useState("")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Check cache first (valid for 1 hour)
        const cachedData = sessionStorage.getItem('social_links_cache')
        const cacheTimestamp = sessionStorage.getItem('social_links_cache_time')
        const ONE_HOUR = 60 * 60 * 1000
        
        if (cachedData && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp)
          if (age < ONE_HOUR) {
            const cached = JSON.parse(cachedData)
            setSocialLinks(cached.links)
            setContactPhone(cached.phone)
            return
          }
        }

        // Fetch from API
        const response = await fetch("/api/settings?category=social", {
          next: { revalidate: 3600 } // Cache for 1 hour
        })
        if (response.ok) {
          const data = await response.json()
          
          // Map settings to social links with icons
          const links: SocialLink[] = data.settings
            .filter((s: any) => s.value && s.value.trim() !== "")
            .map((setting: any) => {
              const platform = setting.key.replace("social_", "")
              return {
                key: setting.key,
                value: setting.value,
                platform: platform.charAt(0).toUpperCase() + platform.slice(1),
                icon: getSocialIcon(setting.key)
              }
            })
          
          setSocialLinks(links)
        }

        // Fetch contact phone
        const contactResponse = await fetch("/api/settings?key=contact_phone", {
          next: { revalidate: 3600 }
        })
        if (contactResponse.ok) {
          const contactData = await contactResponse.json()
          if (contactData.setting?.value) {
            setContactPhone(contactData.setting.value)
            
            // Cache the results
            sessionStorage.setItem('social_links_cache', JSON.stringify({
              links: socialLinks,
              phone: contactData.setting.value
            }))
            sessionStorage.setItem('social_links_cache_time', Date.now().toString())
          }
        }
      } catch (error) {
        console.error("Error fetching social links:", error)
      }
    }

    fetchSettings()
  }, [])

  const getSocialIcon = (key: string): React.ReactNode => {
    switch (key) {
      case "social_facebook":
        return <Facebook className="h-5 w-5" />
      case "social_instagram":
        return <Instagram className="h-5 w-5" />
      case "social_twitter":
        return <Twitter className="h-5 w-5" />
      case "social_tiktok":
        return <FaTiktok className="h-5 w-5" />
      case "social_youtube":
        return <Youtube className="h-5 w-5" />
      case "social_linkedin":
        return <Linkedin className="h-5 w-5" />
      case "social_whatsapp":
        return <MessageCircle className="h-5 w-5" />
      default:
        return null
    }
  }

  const footerLinks = {
    shop: [
      { name: "All Products", href: "/shop" },
      { name: "Flower", href: "/shop?category=FLOWER" },
      { name: "Accessories", href: "/shop?category=ACCESSORIES" },
    ],
    account: [
      { name: "My Account", href: "/account" },
      { name: "My Orders", href: "/orders" },
      { name: "Favourites", href: "/favourites" },
    ],
  }

  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="text-2xl font-bold text-primary">
              OG Farms
            </Link>
            <p className="mt-4 text-sm text-gray-300">
              Premium cannabis products delivered to your door. Quality you can trust.
            </p>
            {contactPhone && (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-300">
                <Phone className="h-4 w-4" />
                <a href={`tel:${contactPhone}`} className="hover:text-primary transition-colors">
                  {contactPhone}
                </a>
              </div>
            )}
            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.key}
                    href={link.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                    title={link.platform}
                  >
                    {link.icon}
                    <span className="sr-only">{link.platform}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-white">Shop</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-sm font-semibold text-white">Account</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} OG Farms. All rights reserved.
          </p>
          <p className="mt-2 text-center text-xs text-gray-500">
            Must be 18+ to purchase. Please consume responsibly.
          </p>
        </div>
      </div>
    </footer>
  )
}
