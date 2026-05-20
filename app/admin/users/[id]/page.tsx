'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatPrice } from '@/lib/format'

interface UserDetail {
  id: string
  email: string
  name: string | null
  phone: string | null
  address: string | null
  role: string
  points: number
  tier: string
  createdAt: string
  orders: { id: string; status: string; totalAmount: number; createdAt: string; orderItems: { quantity: number; priceAtPurchase: number; product: { name: string } }[] }[]
  _count: { orders: number; wishlistItems: number; cartItems: number }
}

const ROLE_OPTIONS = ['USER', 'ADMIN']
const TIER_OPTIONS = ['SILVER', 'GOLD', 'PLATINUM']

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleUpdate = async (updates: Record<string, any>) => {
    if (!user) return
    setSaving(true)
    setSuccess('')
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update')
      const updated = await res.json()
      setUser({ ...user, ...updated })
      setSuccess('Updated successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
        <Link href="/admin/users" className="text-sm underline mt-2 inline-block">Back to users</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold">{user.name || 'Unnamed User'}</h1>
      </div>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold">{user._count.orders}</p>
              <p className="text-xs text-gray-500 mt-1">Orders</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold">{user.points}</p>
              <p className="text-xs text-gray-500 mt-1">Points</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold">{user._count.wishlistItems}</p>
              <p className="text-xs text-gray-500 mt-1">Wishlist</p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Recent Orders</h2>
            {user.orders.length === 0 ? (
              <p className="text-gray-400 text-center py-6">No orders yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {user.orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium">{order.id.slice(0, 12)}...</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatPrice(order.totalAmount)}</p>
                      <p className="text-xs text-gray-500">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Edit User */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Name</label>
                <input
                  type="text"
                  defaultValue={user.name || ''}
                  onBlur={(e) => handleUpdate({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Email</label>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                <input
                  type="text"
                  defaultValue={user.phone || ''}
                  onBlur={(e) => handleUpdate({ phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Role</label>
                <select
                  value={user.role}
                  onChange={(e) => handleUpdate({ role: e.target.value })}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Tier</label>
                <select
                  value={user.tier}
                  onChange={(e) => handleUpdate({ tier: e.target.value })}
                  disabled={saving}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
                >
                  {TIER_OPTIONS.map((tier) => (
                    <option key={tier} value={tier}>{tier}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Points</label>
                <input
                  type="number"
                  defaultValue={user.points}
                  onBlur={(e) => handleUpdate({ points: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Account Info</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Joined</p>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Address</p>
                <p className="font-medium">{user.address || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}