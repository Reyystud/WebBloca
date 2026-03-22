'use client'

import { useCart } from '@/context/cart-context'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalPrice, getItemCount } = useCart()

  const subtotal = getTotalPrice()
  const freeShippingThreshold = 100
  const shippingProgress = (subtotal / freeShippingThreshold) * 100

  // Sample recommended products
  const recommendedProducts = [
    { id: 'r1', name: 'Minimalist Thread Wrap', price: 39.99 },
    { id: 'r2', name: 'Pearl & Silver Mix', price: 59.99 },
  ]

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white shadow-lg z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag size={48} className="text-gray-300 mb-4" />
              <p className="text-lg font-semibold mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-600 mb-6">
                Start shopping to add items to your cart
              </p>
              <button
                onClick={closeCart}
                className="btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-6">
                  {/* Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <p className="text-xs text-gray-400">Image</p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      ${item.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <>
            {/* Free Shipping Progress */}
            <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm font-semibold mb-3">
                Free shipping on orders over $100
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-300"
                  style={{ width: `${Math.min(shippingProgress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {subtotal < freeShippingThreshold
                  ? `Add $${(freeShippingThreshold - subtotal).toFixed(2)} more for free shipping`
                  : '✓ Free shipping qualified!'}
              </p>
            </div>

            {/* Recommended Products */}
            {recommendedProducts.length > 0 && (
              <div className="px-6 py-6 border-t border-gray-200 bg-white">
                <h3 className="text-sm font-semibold mb-4">Recommended for you</h3>
                <div className="space-y-3">
                  {recommendedProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold">{product.name}</p>
                        <p className="text-xs text-gray-600">${product.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="px-6 py-6 border-t border-gray-200 bg-white space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">{subtotal >= freeShippingThreshold ? 'Free' : 'Calculated at checkout'}</span>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full btn-primary text-center"
              >
                Proceed to Checkout
              </Link>

              <button
                onClick={closeCart}
                className="w-full py-3 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
