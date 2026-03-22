'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  isBestSeller?: boolean
}

export default function ProductCard({ id, name, price, image, isBestSeller }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  return (
    <div className="group">
      <div
        className="relative bg-gray-50 aspect-square rounded-lg overflow-hidden mb-4 cursor-pointer transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <p className="text-gray-400 text-sm">Product Image</p>
        </div>

        {/* Best Seller Badge */}
        {isBestSeller && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-block bg-black text-white text-xs font-semibold px-3 py-1 rounded-full">
              Best Seller
            </span>
          </div>
        )}

        {/* Quick Shop Overlay */}
        <div
          className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button className="btn-primary bg-white text-black hover:bg-gray-50">
            Quick Shop
          </button>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
        >
          <Heart
            size={20}
            className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>
      </div>

      {/* Product Info */}
      <Link href={`/products/${id}`} className="block group">
        <h3 className="text-sm font-semibold mb-2 group-hover:opacity-60 transition-opacity">
          {name}
        </h3>
        <p className="text-sm font-bold text-gray-900">
          ${price.toFixed(2)}
        </p>
      </Link>
    </div>
  )
}
