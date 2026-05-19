'use client'

import { useEffect, useState } from 'react'
import { Package, Calendar, DollarSign, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  quantity: number
  priceAtPurchase: number
  product: { id: string; name: string; image: string }
}

interface Order {
  id: string
  status: string
  totalAmount: number
  shippingAddress: string | null
  createdAt: string
  orderItems: OrderItem[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        You have <span className="font-bold">{orders.length}</span> orders
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-semibold mb-2">No orders yet</p>
          <p className="text-sm text-gray-600 mb-6">
            Start shopping to see your orders here
          </p>
          <Link href="/shop" className="inline-block btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">
                        {order.id.slice(0, 12)}...
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span>
                            {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} items
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      {order.status}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                      <DollarSign size={18} className="text-gray-600" />
                      <span className="text-lg font-bold">${order.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-3">
                      {order.orderItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={item.product.image?.startsWith('/') ? item.product.image : `/${item.product.image}`}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {order.orderItems.length > 3 && (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">
                          +{order.orderItems.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}