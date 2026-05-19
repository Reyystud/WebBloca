'use client'

import { useEffect, useState } from 'react'
import { Heart, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import Link from 'next/link'

interface WishlistItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    price: number
    image: string
  }
  createdAt: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    // For now, show placeholder until wishlist API is connected
    setLoading(false)
  }, [])

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        You have <span className="font-bold">{items.length}</span> items saved
      </p>

      {items.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-semibold mb-2">Your wishlist is empty</p>
          <p className="text-sm text-gray-600 mb-6">
            Save items to your wishlist to view them later
          </p>
          <Link
            href="/shop"
            className="inline-block btn-primary"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors flex flex-col"
            >
              <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <img
                  src={item.product.image?.startsWith('/') ? item.product.image : `/${item.product.image}`}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-bold text-lg mb-2">{item.product.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Added on {new Date(item.createdAt).toLocaleDateString()}
              </p>

              <p className="text-2xl font-bold mb-6">
                ${item.product.price.toFixed(2)}
              </p>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => addItem({ id: item.product.id, name: item.product.name, price: item.product.price, image: item.product.image })}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}