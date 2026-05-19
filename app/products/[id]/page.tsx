'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { Plus, Minus, ShieldCheck, CreditCard, RotateCcw, Heart } from 'lucide-react'
import { ALL_PRODUCTS, Product } from '@/lib/products'
import ProductCard from '@/components/product-card'
import { useCart } from '@/context/cart-context'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const product = ALL_PRODUCTS.find(p => p.id === id)
  
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('STANDARD')
  
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 italic">Product not found.</p>
      </div>
    )
  }

  // Related products for "Frequently Bought Together"
  const relatedProducts = ALL_PRODUCTS
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3)

  const handleAddToCart = () => {
    // Adding to cart context (assuming context handles quantity or we can pass it)
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      })
    }
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Side: Image Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden group">
              <img
                src={product.image.startsWith('/') ? product.image : `/${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <button className="absolute bottom-6 left-6 p-3 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
                <Heart size={20} className="text-gray-400" />
              </button>
            </div>
            
            {/* Thumbnails (Simulated) */}
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-20 aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${i === 1 ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img
                    src={product.image.startsWith('/') ? product.image : `/${product.image}`}
                    alt={`${product.name} view ${i}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Product Details */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-light tracking-tight text-gray-900 mb-2 uppercase">
              {product.name}
            </h1>
            <p className="text-2xl font-medium text-gray-900 mb-8">
              ${product.price.toFixed(2)}
            </p>

            {/* Size Selector */}
            <div className="mb-8">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Select Size</p>
              <div className="flex gap-3">
                {['SMALL', 'STANDARD', 'LARGE'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 border text-xs tracking-widest font-bold transition-all ${
                      selectedSize === size 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-200 text-gray-500 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center border border-gray-200 px-4 py-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:opacity-50 transition-opacity"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:opacity-50 transition-opacity"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white text-xs font-bold tracking-[0.2em] uppercase py-4 hover:opacity-90 transition-opacity"
              >
                Add to Cart
              </button>
            </div>

            {/* Payment Info */}
            <div className="bg-gray-50 p-4 mb-10 text-center">
              <p className="text-[10px] text-gray-500 tracking-wide">
                Pay in 4 interest-free payments of ${(product.price / 4).toFixed(2)} with <span className="font-bold text-black italic">Afterpay</span>
              </p>
            </div>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-12 border-t border-gray-100 pt-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-full">
                  <ShieldCheck size={18} className="text-gray-900" />
                </div>
                <span className="text-xs font-medium text-gray-600">1 Year Warranty</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-full">
                  <RotateCcw size={18} className="text-gray-900" />
                </div>
                <span className="text-xs font-medium text-gray-600">30-Day Returns</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-full">
                  <CreditCard size={18} className="text-gray-900" />
                </div>
                <span className="text-xs font-medium text-gray-600">Secure Checkout</span>
              </div>
            </div>

            {/* Frequently Bought Together */}
            <div className="border-t border-gray-100 pt-10">
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900 mb-8">Frequently Bought Together</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedProducts.map((p) => (
                  <div key={p.id} className="group">
                    <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
                      <img src={p.image.startsWith('/') ? p.image : `/${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest mb-1 truncate">{p.name}</h4>
                    <p className="text-xs text-gray-500 mb-3">${p.price.toFixed(2)}</p>
                    <button 
                      onClick={() => addToCart({ id: p.id, name: p.name, price: p.price, image: p.image })}
                      className="w-full border border-black py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Description Section */}
        <div className="mt-24 max-w-3xl border-t border-gray-100 pt-16">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900 mb-6">Description</h2>
          <div className="prose prose-sm text-gray-500 font-light leading-relaxed">
            <p>
              {product.description || "Indulge in the elegance of Bloca's artisanal creations. Each piece is meticulously handcrafted to ensure unique beauty and lasting quality. Our minimalist aesthetic focuses on pure forms and premium materials, making it the perfect addition to any modern ensemble."}
            </p>
            {product.features && (
              <ul className="mt-6 space-y-2 list-none p-0">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-black rounded-full" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
