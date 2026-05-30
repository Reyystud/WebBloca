'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative w-full min-h-screen md:h-screen bg-white pt-16 overflow-hidden flex flex-col md:block">
      <div className="flex-1 md:h-full w-full grid grid-cols-1 md:grid-cols-2">
        
        {/* Left: Content */}
        <div className="relative flex items-center justify-center px-6 sm:px-12 md:px-20 py-12 md:py-20 z-10 bg-white">
          <div className={`max-w-xl transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-black" />
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-black">New Arrival</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black leading-[0.85] mb-8 tracking-tighter text-gray-900">
              Artisanal <br />
              <span className="text-gray-300">Elegance</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-gray-500 mb-10 leading-relaxed font-light max-w-md">
              Indulge in our curated collection of handcrafted artisan pieces. Precision in every detail, stories in every thread.
            </p>
            
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link
                href="/shop"
                className="group relative overflow-hidden bg-black text-white px-8 sm:px-10 py-4 text-[10px] font-bold tracking-[0.3em] uppercase transition-all hover:bg-gray-900"
              >
                <span className="relative z-10">Shop Collection</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
              
              <Link
                href="/#story"
                className="px-8 sm:px-10 py-4 text-[10px] font-bold tracking-[0.3em] uppercase border border-gray-100 hover:border-black transition-colors"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="relative h-[50vh] md:h-full w-full bg-white overflow-hidden">
          <div className={`h-full w-full transition-all duration-[1.5s] ease-in-out ${isLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}>
            <img 
              src="/Model/image.png" 
              alt="Bloca Premium Artisan Piece" 
              className="w-full h-full object-cover object-center contrast-[1.02] brightness-[1.02]"
            />
          </div>
          {/* Subtle gradient overlay to blend even better if needed */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
        </div>

      </div>

      {/* Decorative element: Bottom Label */}
      <div className="absolute bottom-12 left-12 hidden lg:block">
        <p className="text-[10px] font-medium tracking-[0.5em] uppercase text-gray-300 rotate-90 origin-left translate-x-4">
          Est. 2026
        </p>
      </div>
    </section>
  )
}
