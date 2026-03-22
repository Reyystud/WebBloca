import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen bg-white pt-16">
      <div className="absolute inset-0">
        <div className="flex h-full">
          {/* Left: Content */}
          <div className="w-full md:w-1/2 flex items-center justify-center md:justify-start px-6 sm:px-8 md:px-12 py-20">
            <div className="max-w-lg">
              <h1 className="text-6xl sm:text-7xl font-black leading-tight mb-8 text-balance">
                Premium Crafted
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Handmade bracelets designed with precision and care. Each piece tells a story.
              </p>
              <Link
                href="/products"
                className="inline-block btn-primary"
              >
                Shop Now
              </Link>
            </div>
          </div>

          {/* Right: Image */}
          <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-50">
            <div className="relative w-full h-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-sm">Hero Image</p>
                  <p className="text-xs mt-2">Premium Bracelet Photography</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
