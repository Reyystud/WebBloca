'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Package, MapPin, Truck } from 'lucide-react'

const visualSteps = ['ON PROCESS', 'ON THE WAY', 'SHIPPED']

const statusToVisualIdx = (status: string) => {
  if (status === 'PROCESSING') return 0
  if (status === 'SHIPPED') return 1
  if (status === 'DELIVERED') return 2
  return -1
}

export default function ShippingTrackingPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[60vh]">
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/account/orders/${id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Shipping Tracking</h1>
          <p className="text-sm text-gray-500">Order #{order.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Order Progress */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-10 shadow-sm">
            {/* Desktop Horizontal Progress */}
            <div className="hidden md:flex relative justify-between items-center mb-16 px-4">
              <div className="absolute left-8 right-8 top-1/2 h-1 bg-gray-100 -z-0 -translate-y-1/2 rounded-full"></div>
              <div 
                className="absolute left-8 top-1/2 h-1 bg-black -z-0 -translate-y-1/2 transition-all duration-700 ease-in-out rounded-full" 
                style={{ width: `calc(${(Math.max(0, statusToVisualIdx(order.status)) / 2) * 100}% - 4rem)` }}
              ></div>
              
              {visualSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white transition-colors duration-500 ${
                    i <= statusToVisualIdx(order.status) ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i < statusToVisualIdx(order.status) ? '✓' : i + 1}
                  </div>
                  <p className={`text-[10px] uppercase font-black tracking-widest mt-4 absolute -bottom-8 whitespace-nowrap transition-colors duration-500 ${
                    i <= statusToVisualIdx(order.status) ? 'text-black' : 'text-gray-400'
                  }`}>
                    {step}
                  </p>
                </div>
              ))}
            </div>

            {/* Mobile Vertical Progress */}
            <div className="md:hidden relative flex flex-col justify-between mb-8 pl-2 space-y-10">
              <div className="absolute left-[1.6rem] top-6 bottom-6 w-1 bg-gray-100 -z-0 rounded-full"></div>
              <div 
                className="absolute left-[1.6rem] top-6 w-1 bg-black -z-0 transition-all duration-700 ease-in-out rounded-full" 
                style={{ height: `calc(${(Math.max(0, statusToVisualIdx(order.status)) / 2) * 100}% - 3rem)` }}
              ></div>
              
              {visualSteps.map((step, i) => (
                <div key={step} className="flex items-center relative z-10 gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 border-white transition-colors duration-500 shrink-0 ${
                    i <= statusToVisualIdx(order.status) ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i < statusToVisualIdx(order.status) ? '✓' : i + 1}
                  </div>
                  <p className={`text-xs uppercase font-black tracking-widest transition-colors duration-500 ${
                    i <= statusToVisualIdx(order.status) ? 'text-black' : 'text-gray-400'
                  }`}>
                    {step}
                  </p>
                </div>
              ))}
            </div>

            <hr className="my-8 border-gray-100" />
            
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6">Tracking Updates</h3>
              
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-8">
                {statusToVisualIdx(order.status) >= 2 && (
                  <div className="relative animate-fade-in-up">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 bg-black rounded-full border-[3px] border-white shadow-sm"></div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{new Date(order.updatedAt).toLocaleString()}</p>
                    <p className="text-sm font-bold mt-1">Package has been successfully delivered</p>
                    <p className="text-xs text-gray-500 mt-1">Receiver: {order.shippingName || 'Customer'}</p>
                  </div>
                )}
                
                {statusToVisualIdx(order.status) >= 1 && (
                  <>
                    <div className="relative animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                      <div className="absolute -left-[31px] top-1 w-4 h-4 bg-black rounded-full border-[3px] border-white shadow-sm"></div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">In Transit</p>
                      <p className="text-sm font-bold mt-1">Package is on the way to destination</p>
                      <p className="text-xs text-gray-500 mt-1">Last location: Sorting Center ({order.trackingProvider || 'Courier'})</p>
                    </div>
                    <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                      <div className="absolute -left-[29px] top-1.5 w-3 h-3 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Picked Up</p>
                      <p className="text-sm font-bold mt-1">Package has been picked up by courier</p>
                      <p className="text-xs text-gray-500 mt-1">Courier facility</p>
                    </div>
                  </>
                )}

                {statusToVisualIdx(order.status) >= 0 && (
                  <div className="relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="absolute -left-[29px] top-1.5 w-3 h-3 bg-gray-300 rounded-full border-2 border-white shadow-sm"></div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{new Date(order.paymentPaidAt || order.createdAt).toLocaleString()}</p>
                    <p className="text-sm font-bold mt-1">Order is being processed by Bloca</p>
                    <p className="text-xs text-gray-500 mt-1">Bloca Warehouse, Jakarta</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
              <Truck size={18} className="mr-2" /> Delivery Info
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Courier</p>
                <p className="text-sm font-medium">{order.trackingProvider || 'TBD'}</p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Tracking Resi</p>
                  <p className="text-sm font-mono font-bold bg-gray-50 p-2 rounded inline-block">{order.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center">
              <MapPin size={18} className="mr-2" /> Destination
            </h2>
            <div className="space-y-1 text-sm">
              {order.shippingName && <p className="font-bold">{order.shippingName}</p>}
              <p className="text-gray-600 leading-relaxed">{order.shippingAddress}</p>
              <p className="text-gray-600">{order.shippingCity}{order.shippingProvince ? `, ${order.shippingProvince}` : ''} {order.shippingPostalCode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
