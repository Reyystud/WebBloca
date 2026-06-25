'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Copy, Loader2, QrCode, Building } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/format'

function PaymentContent() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const method = searchParams.get('method') || 'QRIS'
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [copied, setCopied] = useState(false)

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

  const handleConfirmPayment = async () => {
    setConfirming(true)
    try {
      // Simulate API call to mark as paid
      const res = await fetch(`/api/orders/${id}/simulate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method })
      })
      if (res.ok) {
        router.push(`/account/orders/${id}/shipping`)
      } else {
        const errData = await res.json().catch(() => ({}))
        alert(`Payment simulation failed: ${errData.error || res.statusText}`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setConfirming(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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

  const totalAmount = Number(order.totalAmount) + Number(order.shippingCost || 0)
  const vaNumber = "8801" + order.id.replace(/\D/g, '').slice(0, 8).padEnd(8, '0')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/account/orders/${id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-sm text-gray-500">Order #{order.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
        <h2 className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-2">Total Payment</h2>
        <p className="text-4xl font-black mb-8">{formatPrice(totalAmount)}</p>

        {method === 'QRIS' ? (
          <div className="flex flex-col items-center">
            <div className="w-64 h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-6 relative overflow-hidden">
              <QrCode size={120} className="text-gray-300 absolute opacity-20" />
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bloca-payment-${order.id}`} 
                alt="QRIS Barcode" 
                className="w-48 h-48 z-10 mix-blend-multiply"
              />
            </div>
            <p className="text-sm text-gray-600 mb-2">Scan this QR Code using any supported app</p>
            <div className="flex gap-2 justify-center mb-8">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold">Gopay</span>
              <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-bold">OVO</span>
              <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-bold">Dana</span>
              <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs font-bold">ShopeePay</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center max-w-sm mx-auto">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Building size={32} className="text-blue-600" />
            </div>
            <p className="font-bold text-lg mb-1">Bank Transfer (Virtual Account)</p>
            <p className="text-sm text-gray-500 mb-6">Transfer exactly the total amount to the account below</p>
            
            <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 mb-8 relative group">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 text-left">Virtual Account Number</p>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-mono font-bold tracking-widest">{vaNumber}</p>
                <button 
                  onClick={() => copyToClipboard(vaNumber)}
                  className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}

        <hr className="border-gray-100 my-8" />
        
        <div className="bg-yellow-50 text-yellow-800 text-sm p-4 rounded-lg text-left mb-6">
          <strong>Note:</strong> This is a mockup payment page for demonstration purposes. Clicking the button below will immediately mark the order as PAID.
        </div>

        <Button 
          onClick={handleConfirmPayment} 
          disabled={confirming} 
          className="btn-primary w-full h-14 text-lg"
        >
          {confirming ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          Simulate Successful Payment
        </Button>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
