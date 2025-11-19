import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight">
            Don&apos;t Panic,
            <br />
            <span className="text-primary">It&apos;s Organic.</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-gray-300">
            High quality medical and recreational cannabis with fast and discreet delivery anywhere in the States.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href="/shop">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 bg-transparent border-white text-white hover:bg-white hover:text-black">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Clean, Legal Weed</h3>
            <p className="text-gray-400 text-sm text-center">
              Sourced from quality producers from our dealers for you
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">2-Day Delivery</h3>
            <p className="text-gray-400 text-sm text-center">
              Expedited delivery to keep you Canadian fresh all at times
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3 p-6 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Discreet Packaging</h3>
            <p className="text-gray-400 text-sm text-center">
              Unmarked packaging to keep your business private and physical
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
