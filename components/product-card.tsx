'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/cart-context'

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
  const { addToCart } = useCart()

  return (
    <Link href={`/products/${id}`} className="group block">
      <div
        className="relative bg-gray-50 aspect-square rounded-lg overflow-hidden mb-4 cursor-pointer transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {image ? (
          <img
            src={image.startsWith('/') || image.startsWith('http') ? image : `/${image}`}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Product Image</p>
          </div>
        )}

        {/* Best Seller Badge */}
        {isBestSeller && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-block bg-black text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
              Best Seller
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-sm"
        >
          <Heart
            size={18}
            className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>
      </div>

      {/* Product Info & Action */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 flex-1">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 group-hover:opacity-60 transition-opacity truncate">
            {name}
          </h3>
          <p className="text-xs font-medium text-gray-500">
            ${price.toFixed(2)}
          </p>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart({ id, name, price, image });
          }}
          className="p-2.5 bg-gray-900 text-white rounded-full hover:bg-black transition-colors shadow-sm"
          title="Add to Cart"
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </Link>
  )
}
