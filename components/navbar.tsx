'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Search, User, ShoppingBag, Menu, X, Shield, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import { useAuth } from '@/context/auth-context'
import { useTheme } from '@/context/theme-context'
import { cn } from "@/lib/utils"
import { ALL_PRODUCTS, Product } from '@/lib/products'

const CATEGORIES = [
  {
    name: 'BRACELETS',
    href: '/shop?category=Bracelet',
    subcategories: ['Bon', 'Bub', 'Wicky', 'Piyo', 'Bilo']
  },
  {
    name: 'BAG CHARMS',
    href: '/shop?category=Bag charm',
    subcategories: ['Ballet', 'Sparkle', 'Tumble', 'Rear']
  },
  {
    name: 'HANDSTRAPS',
    href: '/shop?category=Handstrap',
    subcategories: ['Pay', 'Vast', 'Loom', 'Lite Series']
  },
  {
    name: 'LANYARDS',
    href: '/shop?category=Lanyard',
    subcategories: ['Solitaire', 'Wiki', 'Nibble']
  },
  {
    name: 'HOMME',
    href: '/shop?brand=BLOCA HOMME',
    subcategories: ['Bracelet', 'Bag charm', 'Necklace', 'Handstrap']
  }
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const { getItemCount, openCart } = useCart()
  const { user, profile, loading, signOut } = useAuth()
  const { isDark } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchActive])

  // Real-time search logic and results filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    // Local filtering for live preview
    const query = searchQuery.toLowerCase().trim()
    const filtered = ALL_PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.subCategory?.toLowerCase().includes(query)
    ).slice(0, 5)
    setSearchResults(filtered)

    const timer = setTimeout(() => {
      const encodedQuery = encodeURIComponent(searchQuery.trim())
      const newUrl = `/shop?search=${encodedQuery}`

      if (pathname === '/shop') {
        router.replace(newUrl, { scroll: false })
      } else {
        router.push(newUrl)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery, pathname, router])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsOverlayOpen(false)
    }
  }

  const closeSearch = () => {
    setIsSearchActive(false)
    setIsOverlayOpen(false)
    setSearchQuery('')
  }

  const currentCategory = CATEGORIES.find(c => c.name === hoveredCategory)

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-[#0f0f0f] border-b border-gray-100 dark:border-gray-800 dark:text-white",
        isScrolled ? "h-16" : "h-20"
      )}
      onMouseLeave={() => {
        setHoveredCategory(null)
        setIsOverlayOpen(false)
      }}
    >
      <div className="w-full px-6 sm:px-10 h-full flex items-center relative z-10 bg-white dark:bg-[#0f0f0f]">
        {/* Kolom Kiri - Logo */}
        <div className="flex-1 flex justify-start items-center">
          <Link
            href="/"
            className={cn(
              "text-2xl font-black tracking-tighter hover:opacity-75 transition-all duration-300",
              isSearchActive ? "opacity-0 invisible w-0" : "opacity-100 visible"
            )}
            onClick={closeSearch}
          >
            BLOCA.
          </Link>
        </div>

        {/* Kolom Tengah - Navigation & Search Bar */}
        <div className="flex-none flex items-center justify-center h-full">
          {isSearchActive ? (
            <div
              className="w-screen max-w-2xl px-4 flex items-center gap-4 transition-all duration-300"
              onMouseEnter={() => setIsOverlayOpen(true)}
            >
              <Search size={18} className="text-gray-400 dark:text-white shrink-0" />
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="SEARCH OUR PRODUCTS..."
                  className="w-full text-sm font-bold tracking-[0.2em] outline-none placeholder:text-gray-300 dark:placeholder:text-gray-500 uppercase bg-transparent dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsOverlayOpen(true)}
                />
              </form>
              <button
                onClick={closeSearch}
                className="p-1 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] rounded-full transition-colors shrink-0 dark:text-white"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1">
              <Link
                href="/shop"
                className="px-4 h-full flex items-center text-[11px] font-bold tracking-[0.2em] hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                onClick={closeSearch}
                onMouseEnter={() => setHoveredCategory(null)}
              >
                ALL ITEMS
              </Link>

              <Link
                href="/shop?category=Best seller"
                className="px-4 h-full flex items-center text-[11px] font-bold tracking-[0.2em] hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                onClick={closeSearch}
                onMouseEnter={() => setHoveredCategory(null)}
              >
                BEST SELLERS
              </Link>

              {CATEGORIES.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={cn(
                    "px-4 h-full flex items-center text-[11px] font-bold tracking-[0.2em] transition-colors relative whitespace-nowrap",
                    hoveredCategory === category.name
                      ? "text-black dark:text-gray-300"
                      : "text-gray-900 dark:text-white hover:text-gray-500 dark:hover:text-gray-300"
                  )}
                  onMouseEnter={() => setHoveredCategory(category.name)}
                  onClick={closeSearch}
                >
                  {category.name}
                  {hoveredCategory === category.name && category.subcategories.length > 0 && (
                    <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-black dark:bg-white" />
                  )}
                </Link>
              ))}

              <Link
                href="/shop?category=Sale item"
                className="px-4 h-full flex items-center text-[11px] font-bold tracking-[0.2em] text-red-600 hover:opacity-75 transition-opacity"
                onClick={closeSearch}
              >
                SALE
              </Link>
            </div>
          )}
        </div>

        {/* Kolom Kanan - Actions */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1 mr-2 cursor-pointer hover:opacity-60 transition-opacity">
            <span className="text-[10px] font-bold tracking-widest">ID</span>
            <ChevronDown size={12} />
          </div>

          {!isSearchActive && (
            <button
              onClick={() => { setIsSearchActive(true); setIsOverlayOpen(true); }}
              className="p-2 hover:opacity-60 transition-opacity"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
          )}

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
            <Link href="/auth/login" className="p-2 hover:opacity-60 transition-opacity" onClick={closeSearch}>
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}

          <button
            onClick={() => { openCart(); closeSearch(); }}
            className="p-2 hover:opacity-60 transition-opacity relative"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {getItemCount()}
            </span>
          </button>

          <button
            onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); closeSearch(); }}
            className="lg:hidden p-2 hover:opacity-60 transition-opacity"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Results Overlay */}
      <div
        className={cn(
          "absolute inset-x-0 top-full bg-white dark:bg-[#0f0f0f] z-0 transition-all duration-300 overflow-hidden shadow-2xl border-t border-gray-100 dark:border-gray-800",
          isOverlayOpen && isSearchActive && searchQuery.trim() ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
        onMouseEnter={() => setIsOverlayOpen(true)}
      >
        <div className="w-full px-6 sm:px-10 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Products</h3>
            {searchResults.length > 0 ? (
              <div className="flex flex-col gap-4">
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    onClick={closeSearch}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-16 h-16 bg-gray-50 dark:bg-[#1a1a1a] rounded overflow-hidden shrink-0">
                      <img
                        src={`/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold tracking-wider uppercase group-hover:text-gray-500 dark:text-white transition-colors">
                        {product.name}
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No products found</p>
            )}
            <Link
              href={`/shop?search=${encodeURIComponent(searchQuery)}`}
              onClick={closeSearch}
              className="text-[10px] font-bold tracking-[0.2em] uppercase border-b border-black dark:border-white dark:text-white w-fit pb-1 hover:opacity-60 transition-opacity"
            >
              View all results
            </Link>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Quick Links</h3>
            <div className="flex flex-col gap-4">
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={closeSearch}
                  className="text-xs font-bold tracking-[0.1em] hover:text-gray-500 dark:text-white dark:hover:text-gray-300 transition-colors uppercase"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Mini Bar */}
      <div
        className={cn(
          "absolute left-0 right-0 bg-white dark:bg-[#1a1a1a] border-b border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out overflow-hidden z-0",
          hoveredCategory && currentCategory && currentCategory.subcategories.length > 0 && !isSearchActive ? "h-12 translate-y-0 opacity-100" : "h-0 -translate-y-4 opacity-0"
        )}
      >
        <div className="w-full px-6 sm:px-10 h-full flex items-center justify-center gap-12">
          {currentCategory?.subcategories.map((sub) => (
            <Link
              key={sub}
              href={`${currentCategory.href}&subcategory=${sub}`}
              className="text-[10px] font-bold tracking-[0.2em] text-gray-500 hover:text-black dark:text-white dark:hover:text-gray-300 transition-colors uppercase"
              onClick={closeSearch}
            >
              {sub}
            </Link>
          ))}
          <Link
            href={currentCategory?.href || "/shop"}
            className="text-[10px] font-black tracking-[0.2em] text-black dark:text-white hover:opacity-60 transition-opacity uppercase border-b border-black dark:border-white"
            onClick={closeSearch}
          >
            Shop All
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-[#0f0f0f] border-t border-gray-100 dark:border-gray-800 absolute top-full left-0 w-full max-h-[calc(100vh-64px)] overflow-y-auto shadow-xl">
          <div className="flex flex-col p-6 gap-6">
            <Link
              href="/shop"
              className="text-xs font-bold tracking-[0.2em] uppercase dark:text-white"
              onClick={() => { setIsMobileMenuOpen(false); closeSearch(); }}
            >
              All Items
            </Link>

            <Link
              href="/shop?category=Best seller"
              className="text-xs font-bold tracking-[0.2em] uppercase dark:text-white"
              onClick={() => { setIsMobileMenuOpen(false); closeSearch(); }}
            >
              Best Sellers
            </Link>

            {CATEGORIES.map(category => (
              <div key={category.name} className="flex flex-col gap-4">
                <Link
                  href={category.href}
                  className="text-xs font-bold tracking-[0.2em] uppercase dark:text-white"
                  onClick={() => { setIsMobileMenuOpen(false); closeSearch(); }}
                >
                  {category.name}
                </Link>
                {category.subcategories.length > 0 && (
                  <div className="flex flex-col gap-3 pl-4 border-l border-gray-100 dark:border-gray-800">
                    {category.subcategories.map(sub => (
                      <Link
                        key={sub}
                        href={`${category.href}&subcategory=${sub}`}
                        className="text-xs text-gray-500 dark:text-white dark:hover:text-gray-300 transition-colors"
                        onClick={() => { setIsMobileMenuOpen(false); closeSearch(); }}
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/shop?category=Sale item"
              className="text-xs font-bold tracking-[0.2em] uppercase text-red-600"
              onClick={() => { setIsMobileMenuOpen(false); closeSearch(); }}
            >
              Sale
            </Link>

            <hr className="border-gray-100 dark:border-gray-800" />

            <div className="flex flex-col gap-4">
              {user ? (
                <>
                  <Link href="/account" className="text-xs font-bold tracking-[0.2em] uppercase dark:text-white" onClick={() => { setIsMobileMenuOpen(false); closeSearch(); }}>Account</Link>
                  <button onClick={() => { signOut(); setIsMobileMenuOpen(false); closeSearch(); }} className="text-xs font-bold tracking-[0.2em] uppercase text-red-600 text-left">Sign Out</button>
                </>
              ) : (
                <Link href="/auth/login" className="text-xs font-bold tracking-[0.2em] uppercase dark:text-white" onClick={() => { setIsMobileMenuOpen(false); closeSearch(); }}>Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
