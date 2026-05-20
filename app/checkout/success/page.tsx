'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>
        <p className="text-gray-600 mb-2">
          Thank you for your order. We&apos;ll send you a confirmation email shortly.
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        )}
        <p className="text-sm text-gray-500 mb-8">
          Your order is currently pending payment. You can view the payment details in your order history.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/account">
            <Button className="btn-primary">View Orders</Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}