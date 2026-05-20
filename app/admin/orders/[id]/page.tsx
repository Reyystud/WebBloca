'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, ExternalLink, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatPrice } from '@/lib/format'

interface Payment {
  id: string
  xenditInvoiceId: string | null
  xenditExternalId: string | null
  amount: number
  paymentMethod: string | null
  paymentStatus: string
  paymentUrl: string | null
  paidAt: string | null
  expiredAt: string | null
  createdAt: string
}

interface OrderDetail {
  id: string
  status: string
  paymentStatus: string
  totalAmount: number
  shippingCost: number
  shippingName: string | null
  shippingPhone: string | null
  shippingAddress: string | null
  shippingCity: string | null
  shippingProvince: string | null
  shippingPostalCode: string | null
  trackingNumber: string | null
  trackingProvider: string | null
  paymentMethod: string | null
  paymentReference: string | null
  paymentPaidAt: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string; phone: string | null }
  orderItems: { id: string; productName: string; productImage: string; quantity: number; priceAtPurchase: number; productId: string | null }[]
  payments: Payment[]
}

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const PAYMENT_STATUS_OPTIONS = ['UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED', 'EXPIRED']

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

const paymentStatusColors: Record<string, string> = {
  UNPAID: 'bg-gray-100 text-gray-700 border-gray-200',
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PAID: 'bg-green-100 text-green-700 border-green-200',
  FAILED: 'bg-red-100 text-red-700 border-red-200',
  REFUNDED: 'bg-orange-100 text-orange-700 border-orange-200',
  EXPIRED: 'bg-gray-100 text-gray-500 border-gray-200',
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingProvider, setTrackingProvider] = useState('JNE')

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setOrder(data)
      setTrackingNumber(data.trackingNumber || '')
      setTrackingProvider(data.trackingProvider || 'JNE')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const handleStatusChange = async (field: string, value: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
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

  const handleSaveTracking = async () => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber: trackingNumber || null,
          trackingProvider: trackingProvider || null,
        }),
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

  const getTrackingUrl = (provider: string, trackingNum: string) => {
    switch (provider?.toUpperCase()) {
      case 'JNE': return `https://jne.co.id/tracking-package?awi=${trackingNum}`
      case 'J&T': return `https://jtexpress.co.id/tracking?awb=${trackingNum}`
      case 'SICEPAT': return `https://sicepat.com/tracking?waybill=${trackingNum}`
      default: return `https://jne.co.id/tracking-package?awi=${trackingNum}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
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
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/admin/orders" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold">Order {order.id.slice(0, 12)}...</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
          {order.status}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
          {order.paymentStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Items</h2>
            <div className="divide-y divide-gray-100">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.productImage && (
                      <img
                        src={item.productImage.startsWith('/') ? item.productImage : `/${item.productImage}`}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatPrice(item.priceAtPurchase)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
<span>{formatPrice(order.totalAmount)}</span>
               </div>
               {Number(order.shippingCost) > 0 && (
                 <div className="flex justify-between text-sm">
                   <span className="text-gray-600">Shipping</span>
                   <span>Rp {Number(order.shippingCost).toLocaleString('id-ID')}</span>
                 </div>
               )}
               <div className="flex justify-between font-bold text-lg">
                 <span>Total</span>
                 <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Payment</h2>
            {order.payments.length === 0 ? (
              <p className="text-gray-500 text-sm">No payment records yet.</p>
            ) : (
              <div className="space-y-4">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-sm">Invoice #{payment.xenditInvoiceId || payment.id.slice(0, 8)}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${paymentStatusColors[payment.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                        {payment.paymentStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-medium">{formatPrice(payment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Method</p>
                        <p className="font-medium">{payment.paymentMethod || 'Pending'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      </div>
                      {payment.paidAt && (
                        <div>
                          <p className="text-gray-500">Paid At</p>
                          <p className="font-medium">{new Date(payment.paidAt).toLocaleString()}</p>
                        </div>
                      )}
                      {payment.expiredAt && (
                        <div>
                          <p className="text-gray-500">Expires</p>
                          <p className="font-medium">{new Date(payment.expiredAt).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    {payment.paymentUrl && (
                      <a href={payment.paymentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:underline">
                        View Invoice <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping / Tracking */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Shipping & Tracking</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trackingProvider">Courier</Label>
                  <select
                    id="trackingProvider"
                    value={trackingProvider}
                    onChange={(e) => setTrackingProvider(e.target.value)}
                    className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
                  >
                    <option value="JNE">JNE</option>
                    <option value="J&T">J&T</option>
                    <option value="SICEPAT">SiCepat</option>
                    <option value="ANTERAJA">AnterAja</option>
                    <option value="NINJA">Ninja Xpress</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="trackingNumber">Tracking Number</Label>
                  <Input
                    id="trackingNumber"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="mt-1"
                  />
                </div>
              </div>

              {order.trackingNumber && (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Current Tracking</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{order.trackingProvider}: {order.trackingNumber}</p>
                    <a
                      href={getTrackingUrl(order.trackingProvider || '', order.trackingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1 text-sm"
                    >
                      Track <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveTracking} disabled={updating} className="btn-primary w-full">
                {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Tracking Info
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Order Status</h2>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange('status', e.target.value)}
              disabled={updating}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors disabled:opacity-50"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Payment Status</h2>
            <select
              value={order.paymentStatus}
              onChange={(e) => handleStatusChange('paymentStatus', e.target.value)}
              disabled={updating}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors disabled:opacity-50"
            >
              {PAYMENT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {order.paymentPaidAt && (
              <p className="text-sm text-gray-500 mt-2">
                Paid on {new Date(order.paymentPaidAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                <p className="font-medium">{order.shippingName || order.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Email</p>
                <p className="font-medium">{order.user?.email}</p>
              </div>
              {order.shippingPhone && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Phone</p>
                  <p className="font-medium">{order.shippingPhone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
            {order.shippingAddress ? (
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.shippingName}</p>
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}{order.shippingProvince ? `, ${order.shippingProvince}` : ''} {order.shippingPostalCode}</p>
                {order.shippingPhone && <p className="text-gray-500">{order.shippingPhone}</p>}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No shipping address</p>
            )}
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