'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, ShoppingBag, Heart, Gift, LogOut, Menu, X, Shield } from 'lucide-react'
import { useAuth } from '@/context/auth-context'

const menuItems = [
  { href: '/account', label: 'Dashboard', icon: User },
  { href: '/account/orders', label: 'Order History', icon: ShoppingBag },
  { href: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account/rewards', label: 'Rewards', icon: Gift },
]

export default function AccountSidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/auth/login'
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-48 border-r border-gray-200 pr-8">
        {profile && (
          <div className="mb-6">
            <p className="font-semibold text-sm truncate">{profile.name || profile.email}</p>
            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
            {profile.role === 'ADMIN' && (
              <Link href="/admin" className="inline-flex items-center gap-1 mt-1 text-xs text-black font-medium">
                <Shield size={12} />
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mt-8 font-medium"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden mb-6">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg font-semibold"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          Menu
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden space-y-2 mb-6">
          {profile && (
            <div className="mb-4 px-4">
              <p className="font-semibold text-sm">{profile.name || profile.email}</p>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors mt-4 font-medium"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </nav>
      )}
    </>
  )
}