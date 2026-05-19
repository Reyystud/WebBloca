'use client'

import { useEffect, useState } from 'react'
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  recentOrders: any[]
  ordersByStatus: { status: string; _count: { status: number } }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load dashboard data. Make sure you are logged in as admin.</p>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Products', value: stats.totalProducts.toString(), icon: Package, color: 'bg-orange-50 text-orange-600' },
  ]

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Orders by Status Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold mb-4">Orders by Status</h2>
        {stats.ordersByStatus.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.ordersByStatus.map((o) => ({ status: o.status, count: o._count.status }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">No order data yet</p>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-gray-600 hover:text-black transition-colors">
            View all →
          </a>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.slice(0, 10).map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 text-sm font-medium">
                      <a href={`/admin/orders/${order.id}`} className="hover:underline">
                        {order.id.slice(0, 8)}...
                      </a>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {order.user?.name || order.user?.email || 'Unknown'}
                    </td>
                    <td className="py-3 text-sm font-medium">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}