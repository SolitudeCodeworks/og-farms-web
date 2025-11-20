"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0.7 }}
      >
        <source src="/weed_loop.mp4" type="video/mp4" />
      </video>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h1 
            className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-wide font-[family-name:var(--font-bebas)] uppercase"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            Don&apos;t Panic,
            <br />
            <span className="text-primary">It&apos;s Organic.</span>
          </h1>
          
          <p 
            className="mx-auto max-w-2xl text-lg md:text-xl text-gray-300"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            High quality medical and recreational cannabis with fast and discreet delivery anywhere in the States.
          </p>

          <div 
            className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-8"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <Link href="/shop" className="inline-block">
              <button 
                className="text-base px-8 py-3 font-bold rounded-full uppercase tracking-wide transition-all hover:scale-105"
                style={{
                  backgroundColor: '#4ade80',
                  color: '#000',
                  boxShadow: '0 10px 40px rgba(74, 222, 128, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#22c55e'
                  e.currentTarget.style.boxShadow = '0 15px 50px rgba(74, 222, 128, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4ade80'
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(74, 222, 128, 0.3)'
                }}
              >
                Shop Now →
              </button>
            </Link>
            <Link href="/about" className="inline-block">
              <button 
                className="text-base px-8 py-3 text-white font-semibold rounded-full border-2 uppercase tracking-wide transition-all"
                style={{
                  borderColor: '#4ade80',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(74, 222, 128, 0.1)'
                  e.currentTarget.style.borderColor = '#22c55e'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = '#4ade80'
                }}
              >
                Learn More
              </button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Box 1 */}
          <div 
            className="flex flex-col items-center space-y-4 p-8 rounded-2xl backdrop-blur-sm border transition-all group hover:border-primary/60"
            data-aos="fade-up"
            data-aos-delay="100" 
               style={{ 
                 backgroundColor: 'rgba(0, 0, 0, 0.2)',
                 borderColor: 'rgba(74, 222, 128, 0.3)'
               }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center border transition-all group-hover:scale-110" 
                 style={{ 
                   backgroundColor: 'rgba(74, 222, 128, 0.1)',
                   borderColor: 'rgba(74, 222, 128, 0.4)'
                 }}>
              <svg className="w-8 h-8" style={{ color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Clean, Legal Weed</h3>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              Sourced from quality producers from our dealers for you
            </p>
          </div>

          {/* Box 2 */}
          <div 
            className="flex flex-col items-center space-y-4 p-8 rounded-2xl backdrop-blur-sm border transition-all group hover:border-primary/60"
            data-aos="fade-up"
            data-aos-delay="300" 
               style={{ 
                 backgroundColor: 'rgba(0, 0, 0, 0.2)',
                 borderColor: 'rgba(74, 222, 128, 0.3)'
               }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center border transition-all group-hover:scale-110" 
                 style={{ 
                   backgroundColor: 'rgba(74, 222, 128, 0.1)',
                   borderColor: 'rgba(74, 222, 128, 0.4)'
                 }}>
              <svg className="w-8 h-8" style={{ color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">2-Day Delivery</h3>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              Expedited delivery to keep you Canadian fresh all at times
            </p>
          </div>

          {/* Box 3 */}
          <div 
            className="flex flex-col items-center space-y-4 p-8 rounded-2xl backdrop-blur-sm border transition-all group hover:border-primary/60"
            data-aos="fade-up"
            data-aos-delay="500" 
               style={{ 
                 backgroundColor: 'rgba(0, 0, 0, 0.2)',
                 borderColor: 'rgba(74, 222, 128, 0.3)'
               }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center border transition-all group-hover:scale-110" 
                 style={{ 
                   backgroundColor: 'rgba(74, 222, 128, 0.1)',
                   borderColor: 'rgba(74, 222, 128, 0.4)'
                 }}>
              <svg className="w-8 h-8" style={{ color: '#4ade80' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Discreet Packaging</h3>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              Unmarked packaging to keep your business private and physical
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
