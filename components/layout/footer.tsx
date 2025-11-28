import Link from "next/link"
import { Facebook, Instagram, Phone } from "lucide-react"

export function Footer() {
  const footerLinks = {
    shop: [
      { name: "All Products", href: "/shop" },
      { name: "Flower", href: "/shop?category=FLOWER" },
      { name: "Accessories", href: "/shop?category=ACCESSORIES" },
      { name: "New Arrivals", href: "/shop?sort=newest" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
    ],
    support: [
      { name: "FAQ", href: "/faq" },
      { name: "Shipping", href: "/shipping" },
      { name: "Returns", href: "/returns" },
      { name: "Privacy Policy", href: "/privacy" },
    ],
  }

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-2xl font-bold text-primary">
              OG Farms
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium cannabis products delivered to your door. Quality you can trust.
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a href="tel:0739638575" className="hover:text-primary transition-colors">
                073 963 8575
              </a>
            </div>
            <div className="mt-6 flex space-x-4">
              <a
                href="https://www.facebook.com/share/17wy7dDgqt/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.instagram.com/ogfarms2025?utm_source=qr&igsh=MWw1MDlpb2Q4enN0ZA=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Shop</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} OG Farms. All rights reserved.
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Must be 21+ to purchase. Please consume responsibly.
          </p>
        </div>
      </div>
    </footer>
  )
}
