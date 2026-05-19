'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Eye } from 'lucide-react'

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  user: { id: string; name: string | null; email: string }
  orderItems: { quantity: number; priceAtPurchase: number; product: { name: string } }[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    fetch(`/api/admin/orders?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [statusFilter])

  const filtered = orders.filter((order) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      order.id.toLowerCase().includes(q) ||
      order.user?.name?.toLowerCase().includes(q) ||
      order.user?.email?.toLowerCase().includes(q)
    )
  })

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium">{order.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{order.user?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-400">{order.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                    >
                      <Eye size={16} />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No orders found</div>
        )}
      </div>

      <p className="text-sm text-gray-500">{filtered.length} orders</p>
    </div>
  )
}