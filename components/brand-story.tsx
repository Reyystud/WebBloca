'use client'

import { useEffect, useRef, useState } from 'react'

const LIFESTYLE_IMAGES = [
  '/Model/BalletBagCharm.webp',
  '/Model/IvyBracelet.webp',
  '/Model/PiyoSparkleBracelet.webp',
  '/Model/PunzelBracelet.webp',
  '/Model/solitaresparklerings.webp',
  '/Model/IllumaBracelet.webp',
]

export default function BrandStory() {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <section id="story" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Marquee Text */}
        <div className="mb-24 overflow-hidden bg-black text-white py-8 px-6">
          <div
            ref={marqueeRef}
            className="flex gap-12 animate-scroll whitespace-nowrap"
          >
            {[...Array(6)].map((_, i) => (
              <span key={i} className="text-xs font-bold tracking-[0.4em] uppercase">
                Handmade in Indonesia • Premium Materials • Sustainable Practices • Artisan Crafted • Limited Edition
              </span>
            ))}
          </div>
        </div>

        {/* Story Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 items-center">
          <div>
            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-gray-400 mb-6">Our Philosophy</h2>
            <h3 className="text-4xl sm:text-6xl font-black mb-8 tracking-tighter">Artisanship Redefined</h3>
            <p className="text-lg text-gray-500 leading-relaxed mb-6 font-light">
              BLOCA was born from a passion for craftsmanship and sustainable design. Each piece is meticulously handmade by skilled artisans in Indonesia, using only the finest sourced materials.
            </p>
            <p className="text-lg text-gray-500 leading-relaxed font-light">
              We believe in creating pieces that last, that tell stories, and that make a positive impact on communities and the environment.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div className="border-l border-gray-100 pl-6">
              <p className="text-5xl font-black mb-2 tracking-tighter">50K+</p>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Patrons</p>
            </div>
            <div className="border-l border-gray-100 pl-6">
              <p className="text-5xl font-black mb-2 tracking-tighter">100%</p>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Artesanal</p>
            </div>
            <div className="border-l border-gray-100 pl-6">
              <p className="text-5xl font-black mb-2 tracking-tighter">12+</p>
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Years</p>
            </div>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {LIFESTYLE_IMAGES.map((src, i) => (
            <div
              key={i}
              className={`relative bg-gray-50 overflow-hidden group ${
                i === 0 || i === 5 ? 'col-span-2 md:col-span-1 md:row-span-2 h-64 md:h-[600px]' : 'h-48 md:h-[300px]'
              }`}
            >
              <img 
                src={src} 
                alt={`Lifestyle ${i}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  )
}
