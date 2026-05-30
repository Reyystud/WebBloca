'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, User, ShoppingBag, Menu, X, Shield, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { useAuth } from '@/context/auth-context'
import { cn } from "@/lib/utils"

const CATEGORIES = [
  {
    name: 'BRACELETS',
    href: '/shop?category=Bracelet',
    subcategories: ['Bon Claire', 'Bub', 'Wicky']
  },
  {
    name: 'PHONE STRAPS',
    href: '/shop?category=Phone strap',
    subcategories: ['Buggle', 'Basic']
  },
  {
    name: 'BAG CHARMS',
    href: '/shop?category=Bag charm',
    subcategories: ['Ballet', 'Sparkle']
  },
  {
    name: 'KEYCHAINS',
    href: '/shop?category=Keychain',
    subcategories: ['Silver', 'Beaded']
  }
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const { getItemCount, openCart } = useCart()
  const { user, profile, loading, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const currentCategory = CATEGORIES.find(c => c.name === hoveredCategory)

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b border-gray-100",
        isScrolled ? "h-16" : "h-20"
      )}
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between relative z-10 bg-white">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black tracking-tighter hover:opacity-75 transition-opacity"
        >
          BLOCA.
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 h-full">
          <div className="flex items-center gap-1">
            <Link 
              href="/shop"
              className="px-4 h-full flex items-center text-[11px] font-bold tracking-[0.2em] hover:text-gray-500 transition-colors"
            >
              BEST SELLERS
            </Link>

            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className={cn(
                  "px-4 h-full flex items-center text-[11px] font-bold tracking-[0.2em] transition-colors relative",
                  hoveredCategory === category.name ? "text-black" : "text-gray-900 hover:text-gray-500"
                )}
                onMouseEnter={() => setHoveredCategory(category.name)}
              >
                {category.name}
                {hoveredCategory === category.name && (
                  <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-black" />
                )}
              </Link>
            ))}

            <Link 
              href="/shop?category=Sale item"
              className="px-4 h-full flex items-center text-[11px] font-bold tracking-[0.2em] text-red-600 hover:opacity-75 transition-opacity"
            >
              SALE
            </Link>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1 mr-2 cursor-pointer hover:opacity-60 transition-opacity">
            <span className="text-[10px] font-bold tracking-widest">ID</span>
            <ChevronDown size={12} />
          </div>

          <button className="p-2 hover:opacity-60 transition-opacity">
            <Search size={20} strokeWidth={1.5} />
          </button>

          {loading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          ) : user ? (
            <div className="relative group">
              <button className="p-2 hover:opacity-60 transition-opacity">
                <User size={20} strokeWidth={1.5} />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 hidden group-hover:block">
                <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                  My Account
                </Link>
                <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                  Orders
                </Link>
                <Link href="/account/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                  Wishlist
                </Link>
                {profile?.role === 'ADMIN' && (
                  <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors">
                    Admin Dashboard
                  </Link>
                )}
                <hr className="my-1" />
                <button
                  onClick={signOut}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-red-600"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/auth/login" className="p-2 hover:opacity-60 transition-opacity">
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}

          <button
            onClick={openCart}
            className="p-2 hover:opacity-60 transition-opacity relative"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {getItemCount()}
            </span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:opacity-60 transition-opacity"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Secondary Mini Bar (Subcategories) */}
      <div 
        className={cn(
          "absolute left-0 right-0 bg-white border-b border-gray-100 transition-all duration-300 ease-in-out overflow-hidden z-0",
          hoveredCategory && currentCategory ? "h-12 translate-y-0 opacity-100" : "h-0 -translate-y-4 opacity-0"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-center gap-12">
          {currentCategory?.subcategories.map((sub) => (
            <Link
              key={sub}
              href={`${currentCategory.href}&subcategory=${sub}`}
              className="text-[10px] font-bold tracking-[0.2em] text-gray-500 hover:text-black transition-colors uppercase"
            >
              {sub}
            </Link>
          ))}
          <Link
            href={currentCategory?.href || "/shop"}
            className="text-[10px] font-black tracking-[0.2em] text-black hover:opacity-60 transition-opacity uppercase border-b border-black"
          >
            Shop All
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 absolute top-full left-0 w-full max-h-[calc(100vh-64px)] overflow-y-auto shadow-xl">
          <div className="flex flex-col p-6 gap-6">
            <Link
              href="/shop"
              className="text-xs font-bold tracking-[0.2em] uppercase"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Best Sellers
            </Link>
            
            {CATEGORIES.map(category => (
              <div key={category.name} className="flex flex-col gap-4">
                <Link 
                  href={category.href}
                  className="text-xs font-bold tracking-[0.2em] uppercase"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
                <div className="flex flex-col gap-3 pl-4 border-l border-gray-100">
                  {category.subcategories.map(sub => (
                    <Link
                      key={sub}
                      href={`${category.href}&subcategory=${sub}`}
                      className="text-xs text-gray-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <Link
              href="/shop?category=Sale item"
              className="text-xs font-bold tracking-[0.2em] uppercase text-red-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sale
            </Link>

            <hr className="border-gray-100" />

            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  <Link href="/account" className="text-xs font-bold tracking-[0.2em] uppercase" onClick={() => setIsMobileMenuOpen(false)}>Account</Link>
                  <button onClick={() => { signOut(); setIsMobileMenuOpen(false) }} className="text-xs font-bold tracking-[0.2em] uppercase text-red-600 text-left">Sign Out</button>
                </>
              ) : (
                <Link href="/auth/login" className="text-xs font-bold tracking-[0.2em] uppercase" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
