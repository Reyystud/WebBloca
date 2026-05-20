'use client'

import { useEffect, useState } from 'react'
import { Package, Calendar, DollarSign, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'

interface OrderItem {
  id: string
  productName: string
  productImage: string
  quantity: number
  priceAtPurchase: number
}

interface Payment {
  id: string
  paymentStatus: string
  paymentMethod: string | null
}

interface Order {
  id: string
  status: string
  paymentStatus: string
  totalAmount: number
  shippingCost: number
  createdAt: string
  orderItems: OrderItem[]
  payments: Payment[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
}

const paymentStatusColors: Record<string, string> = {
  UNPAID: 'bg-gray-50 text-gray-600 border-gray-200',
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAID: 'bg-green-50 text-green-700 border-green-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
  REFUNDED: 'bg-orange-50 text-orange-700 border-orange-200',
  EXPIRED: 'bg-gray-50 text-gray-500 border-gray-200',
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
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">
                        Order #{order.id.slice(-8).toUpperCase()}
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

                    <div className="flex gap-2 mt-2 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {order.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${paymentStatusColors[order.paymentStatus] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        <CreditCard size={12} className="inline mr-1" />
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                      <DollarSign size={18} className="text-gray-600" />
                      <span className="text-lg font-bold">{formatPrice(order.totalAmount)}</span>
                    </div>

                    <div className="flex gap-3">
                      {order.orderItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          {item.productImage && (
                            <img
                              src={item.productImage.startsWith('/') ? item.productImage : `/${item.productImage}`}
                              alt={item.productName}
                              className="w-full h-full object-cover"
                            />
                          )}
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}