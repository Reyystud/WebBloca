'use client'

import { useEffect, useRef, useState } from 'react'

export default function BrandStory() {
  const marqueeRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)

  return (
    <section id="story" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Marquee Text */}
        <div className="mb-16 overflow-hidden bg-black text-white py-6 px-6 rounded-lg">
          <div
            ref={marqueeRef}
            className="flex gap-8 animate-scroll whitespace-nowrap"
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(true)}
          >
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-lg sm:text-xl font-semibold">
                Handmade in Indonesia • Premium Materials • Sustainable Practices • Artisan Crafted
              </span>
            ))}
          </div>
        </div>

        {/* Story Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              BLOCA was born from a passion for craftsmanship and sustainable design. Each bracelet is handmade by skilled artisans in Indonesia, using only the finest materials.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We believe in creating pieces that last, that tell stories, and that make a positive impact on communities and the environment.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-4xl font-bold mb-2">50K+</p>
              <p className="text-sm text-gray-600">Happy Customers</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">100%</p>
              <p className="text-sm text-gray-600">Handmade</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">12+</p>
              <p className="text-sm text-gray-600">Years Crafting</p>
            </div>
          </div>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`bg-gray-100 rounded-lg overflow-hidden ${
                i === 1 || i === 6 ? 'md:row-span-2' : ''
              }`}
              style={{
                aspectRatio: i === 1 || i === 6 ? 'auto' : '1',
                minHeight: i === 1 || i === 6 ? '400px' : '250px',
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Lifestyle Image {i}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
