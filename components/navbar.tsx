'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, User, ShoppingBag, Menu, X, Shield } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { useAuth } from '@/context/auth-context'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { getItemCount, openCart } = useCart()
  const { user, profile, loading, signOut } = useAuth()

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
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter hover:opacity-75 transition-opacity"
        >
          BLOCA
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/shop" className="text-sm font-medium hover:opacity-60 transition-opacity">
            Shop
          </Link>
          <Link href="/#story" className="text-sm font-medium hover:opacity-60 transition-opacity">
            Story
          </Link>
          {profile?.role === 'ADMIN' && (
            <Link href="/admin" className="text-sm font-medium hover:opacity-60 transition-opacity flex items-center gap-1">
              <Shield size={14} />
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
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
            <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold">
              {getItemCount()}
            </span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:opacity-60 transition-opacity"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

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
            {user ? (
              <>
                <Link href="/account" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Account</Link>
                {profile?.role === 'ADMIN' && (
                  <Link href="/admin" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
                )}
                <button onClick={() => { signOut(); setIsMobileMenuOpen(false) }} className="text-sm font-medium text-red-600 text-left">Sign Out</button>
              </>
            ) : (
              <Link href="/auth/login" className="text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}