'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface OrderDetail {
  id: string
  status: string
  totalAmount: number
  shippingAddress: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string; phone: string | null }
  orderItems: { id: string; quantity: number; priceAtPurchase: number; product: { id: string; name: string; image: string } }[]
}

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const updated = await res.json()
      setOrder(updated)
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Link href="/admin/orders" className="text-sm underline mt-2 inline-block">Back to orders</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold">Order {order.id.slice(0, 12)}...</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Items</h2>
            <div className="divide-y divide-gray-100">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.image?.startsWith('/') ? item.product.image : `/${item.product.image || 'placeholder.jpg'}`}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${item.priceAtPurchase.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 mt-2">
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold text-lg">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Update Status</h2>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {updating && <p className="text-sm text-gray-500 mt-2">Updating...</p>}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                <p className="font-medium">{order.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                <p className="font-medium">{order.user?.email}</p>
              </div>
              {order.shippingAddress && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Shipping Address</p>
                  <p className="font-medium">{order.shippingAddress}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Order Info</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Order ID</p>
                <p className="font-medium text-sm break-all">{order.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Placed On</p>
                <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}