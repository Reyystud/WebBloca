'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { Mail, Phone, MapPin, ShoppingBag, Heart } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth()
  const [stats, setStats] = useState({ orders: 0, wishlist: 0 })
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const orders = await res.json()
          setStats((prev) => ({ ...prev, orders: orders.length }))
        }
      } catch {}
    }
    fetchStats()
  }, [])

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      })
    }
  }, [profile])

  const user = profile || {
    name: 'Guest',
    email: 'guest@example.com',
    phone: null,
    address: null,
    tier: 'SILVER',
    points: 0,
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await refreshProfile()
        setIsEditing(false)
      } else {
        alert('Failed to update profile')
      }
    } catch (err) {
      alert('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  const tierColors: Record<string, string> = {
    SILVER: 'bg-gray-200 text-gray-800',
    GOLD: 'bg-yellow-100 text-yellow-800',
    PLATINUM: 'bg-purple-100 text-purple-800',
  }

  const nextTierPoints: Record<string, number> = {
    SILVER: 1000,
    GOLD: 3000,
    PLATINUM: 10000,
  }

  const nextTier = user.tier === 'SILVER' ? 'Gold' : user.tier === 'GOLD' ? 'Platinum' : null

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold">Profile Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setFormData({
                    name: profile?.name || '',
                    phone: profile?.phone || '',
                    address: profile?.address || '',
                  })
                }}
                disabled={isSaving}
                className="px-4 py-2 text-gray-600 hover:text-black font-semibold text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold text-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-semibold">Full Name</p>
              <p className="text-lg">{user.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1 font-semibold">Email</p>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-500" />
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1 font-semibold">Phone</p>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-500" />
                <p className="text-lg">{user.phone || 'Not set'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1 font-semibold">Address</p>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" />
                <p className="text-lg">{user.address || 'Not set'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm text-gray-600 mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1 font-semibold">Email</p>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500">
                <Mail size={16} />
                <p>{user.email}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1 font-semibold">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1 font-semibold">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[42px]"
                placeholder="Enter your full address"
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Membership Card */}
      <div className="bg-black text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-8">BLOCA Rewards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-gray-300 mb-3 font-semibold">MEMBERSHIP TIER</p>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full font-bold text-sm ${tierColors[user.tier] || tierColors.SILVER}`}>
                {user.tier}
              </span>
              {nextTier && (
                <div>
                  <p className="text-xs text-gray-300">Next tier: {nextTier}</p>
                  <p className="text-sm font-semibold">
                    {(nextTierPoints[user.tier] || 0) - user.points} points away
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-300 mb-3 font-semibold">REWARD POINTS</p>
            <p className="text-4xl font-bold">{user.points}</p>
            <p className="text-xs text-gray-300 mt-1">1 point = $0.01 discount</p>
          </div>
        </div>

        {(user.tier === 'GOLD' || user.tier === 'PLATINUM') && (
          <div className="mt-8 pt-8 border-t border-gray-700">
            <p className="text-sm text-gray-300 mb-4 font-semibold">{user.tier} MEMBER BENEFITS</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {user.tier === 'GOLD' && (
                <>
                  <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">&#10003;</span><span>5% off all purchases</span></li>
                  <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">&#10003;</span><span>Free shipping on all orders</span></li>
                  <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">&#10003;</span><span>Early access to new releases</span></li>
                  <li className="flex items-start gap-2"><span className="text-yellow-400 font-bold">&#10003;</span><span>Birthday gift</span></li>
                </>
              )}
              {user.tier === 'PLATINUM' && (
                <>
                  <li className="flex items-start gap-2"><span className="text-purple-400 font-bold">&#10003;</span><span>10% off all purchases</span></li>
                  <li className="flex items-start gap-2"><span className="text-purple-400 font-bold">&#10003;</span><span>Free express shipping</span></li>
                  <li className="flex items-start gap-2"><span className="text-purple-400 font-bold">&#10003;</span><span>VIP customer support</span></li>
                  <li className="flex items-start gap-2"><span className="text-purple-400 font-bold">&#10003;</span><span>Exclusive gifts</span></li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/account/orders"
          className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-bold text-lg mb-2">Recent Orders</h3>
          <p className="text-sm text-gray-600">{stats.orders} orders placed</p>
        </Link>

        <Link
          href="/account/wishlist"
          className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-bold text-lg mb-2">Wishlist</h3>
          <p className="text-sm text-gray-600">Your saved items</p>
        </Link>
      </div>
    </div>
  )
}