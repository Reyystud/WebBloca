'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/context/cart-context'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { getItemCount, openCart } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter hover:opacity-75 transition-opacity"
        >
          BLOCA
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-sm font-medium hover:opacity-60 transition-opacity">
            Shop
          </Link>
          <Link href="/#story" className="text-sm font-medium hover:opacity-60 transition-opacity">
            Story
          </Link>
          <Link href="/account" className="text-sm font-medium hover:opacity-60 transition-opacity">
            Account
          </Link>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:opacity-60 transition-opacity">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link href="/account" className="p-2 hover:opacity-60 transition-opacity">
            <User size={20} strokeWidth={1.5} />
          </Link>
          <button
            onClick={openCart}
            className="p-2 hover:opacity-60 transition-opacity relative"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">
              {getItemCount()}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:opacity-60 transition-opacity"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="flex flex-col gap-4 p-6">
            <Link
              href="/shop"
              className="text-sm font-medium hover:opacity-60 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/#story"
              className="text-sm font-medium hover:opacity-60 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Story
            </Link>
            <Link
              href="/account"
              className="text-sm font-medium hover:opacity-60 transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Account
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
