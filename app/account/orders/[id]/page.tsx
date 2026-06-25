'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, CreditCard, Truck, ExternalLink, Loader2, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  paymentUrl: string | null
  paidAt: string | null
  expiredAt: string | null
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
  createdAt: string
  orderItems: OrderItem[]
  payments: Payment[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-100 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

const paymentStatusColors: Record<string, string> = {
  UNPAID: 'bg-gray-100 text-gray-600 border-gray-200',
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PAID: 'bg-green-100 text-green-700 border-green-200',
  FAILED: 'bg-red-100 text-red-700 border-red-200',
  REFUNDED: 'bg-orange-100 text-orange-700 border-orange-200',
  EXPIRED: 'bg-gray-100 text-gray-500 border-gray-200',
}

const visualSteps = ['ON PROCESS', 'ON THE WAY', 'SHIPPED']

const statusToVisualIdx = (status: string) => {
  if (status === 'PROCESSING') return 0
  if (status === 'SHIPPED') return 1
  if (status === 'DELIVERED') return 2
  return -1
}

function getTrackingUrl(provider: string, trackingNum: string) {
  switch (provider?.toUpperCase()) {
    case 'JNE': return `https://jne.co.id/tracking-package?awi=${trackingNum}`
    case 'J&T': return `https://jtexpress.co.id/tracking?awb=${trackingNum}`
    case 'SICEPAT': return `https://sicepat.com/tracking?waybill=${trackingNum}`
    default: return `https://jne.co.id/tracking-package?awi=${trackingNum}`
  }
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('QRIS')

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setOrder(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const handlePayNow = async () => {
    if (!order) return
    setPaying(true)
    try {
      // Redirect to the custom payment page with the selected method
      router.push(`/account/orders/${order.id}/pay?method=${selectedPaymentMethod}`)
    } catch (err) {
      console.error(err)
    } finally {
      // Let the new page load, we don't need to reset paying unless error
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      })

      if (res.ok) {
        setOrder({ ...order, status: 'CANCELLED' })
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Link href="/account/orders" className="btn-primary inline-block">Back to Orders</Link>
      </div>
    )
  }



  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/account/orders" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
          <Package size={14} className="inline mr-1" />
          {order.status}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
          <CreditCard size={14} className="inline mr-1" />
          {order.paymentStatus}
        </span>
        {order.trackingNumber && (
          <a
            href={getTrackingUrl(order.trackingProvider || '', order.trackingNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-full text-sm font-medium border bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <Truck size={14} className="inline mr-1" />
            Track Package <ExternalLink size={12} className="inline" />
          </a>
        )}
      </div>

      {/* Order Progress Link */}
      {order.status !== 'CANCELLED' && order.status !== 'PENDING' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">Track Your Order</h3>
            <p className="text-sm text-gray-500">View real-time shipping progress and courier updates.</p>
          </div>
          <Link href={`/account/orders/${order.id}/shipping`} className="btn-primary whitespace-nowrap">
            View Tracking Details
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">Items</h2>
            <div className="divide-y divide-gray-100">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
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
               <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                 <span>Total</span>
                 <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">
                <Truck size={20} className="inline mr-2" />
                Tracking
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Courier</span>
                  <span className="font-medium">{order.trackingProvider || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tracking Number</span>
                  <span className="font-medium font-mono">{order.trackingNumber}</span>
                </div>
                <a
                  href={getTrackingUrl(order.trackingProvider || '', order.trackingNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                >
                  Track Package <ExternalLink size={12} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold mb-4">
              <CreditCard size={20} className="inline mr-2" />
              Payment
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${paymentStatusColors[order.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold">{formatPrice(order.totalAmount)}</span>
              </div>

              {(order.paymentStatus === 'UNPAID' || order.paymentStatus === 'PENDING' || order.paymentStatus === 'EXPIRED') && (
                <>
                  <div className="pt-4 space-y-3">
                    <span className="text-gray-600 text-sm font-medium">Select Payment Option</span>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setSelectedPaymentMethod('QRIS')}
                        disabled={paying || order.paymentStatus === 'PENDING'}
                        className={`py-2.5 px-4 rounded-lg border-2 text-xs uppercase tracking-wider font-bold transition-all ${
                          selectedPaymentMethod === 'QRIS'
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 disabled:opacity-50'
                        }`}
                      >
                        QRIS
                      </button>
                      <button
                        onClick={() => setSelectedPaymentMethod('BANK_TRANSFER')}
                        disabled={paying || order.paymentStatus === 'PENDING'}
                        className={`py-2.5 px-4 rounded-lg border-2 text-xs uppercase tracking-wider font-bold transition-all ${
                          selectedPaymentMethod === 'BANK_TRANSFER'
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400 disabled:opacity-50'
                        }`}
                      >
                        Transfer Bank
                      </button>
                    </div>
                  </div>
                  <Button onClick={handlePayNow} disabled={paying} className="btn-primary w-full mt-4 h-12 text-sm">
                    {paying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {order.paymentStatus === 'EXPIRED' ? 'Pay Again' : 'Pay Now'}
                  </Button>
                </>
              )}

              {order.status === 'PENDING' && (
                <div className="pt-2">
                  <button
                    onClick={handleCancelOrder}
                    className="w-full py-2.5 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4">
                <MapPin size={20} className="inline mr-2" />
                Shipping Address
              </h2>
              <div className="space-y-1 text-sm">
                {order.shippingName && <p className="font-medium">{order.shippingName}</p>}
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}{order.shippingProvince ? `, ${order.shippingProvince}` : ''} {order.shippingPostalCode}</p>
                {order.shippingPhone && (
                  <p className="flex items-center gap-1 text-gray-500">
                    <Phone size={14} /> {order.shippingPhone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}