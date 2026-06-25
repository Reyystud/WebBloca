'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useCart } from '@/context/cart-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Package, MapPin, Truck, ArrowLeft, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/format'

interface ShippingOption {
  city: string
  province: string
  courier: string
  service: string
  price: number
  estimatedDays: string
}

export default function CheckoutPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { items, isLoading: cartLoading, getTotalPrice, getItemCount, clearCart } = useCart()
  const router = useRouter()

  const [step, setStep] = useState<'address' | 'shipping' | 'review'>('address')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingProvince: '',
    shippingPostalCode: '',
  })

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [shippingLoading, setShippingLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/account?redirect=/checkout')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        shippingName: profile.name || '',
        shippingPhone: profile.phone || '',
        shippingAddress: profile.address || '',
      }))
    }
  }, [profile])

  const subtotal = getTotalPrice()

  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.shippingName || !form.shippingPhone || !form.shippingAddress || !form.shippingCity || !form.shippingProvince || !form.shippingPostalCode) {
      setError('Please fill in all shipping fields')
      return
    }

    setShippingLoading(true)
    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: form.shippingCity }),
      })
      if (res.ok) {
        const options = await res.json()
        setShippingOptions(options)
        if (options.length > 0) {
          setSelectedShipping(options[0])
        }
      }
    } catch {
      setShippingOptions([
        { city: form.shippingCity, province: form.shippingProvince, courier: 'JNE', service: 'REG', price: 25000, estimatedDays: '3-5' },
      ])
      setSelectedShipping({ city: form.shippingCity, province: form.shippingProvince, courier: 'JNE', service: 'REG', price: 25000, estimatedDays: '3-5' })
    }
    setShippingLoading(false)
    setStep('shipping')
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedShipping) {
      setError('Please select a shipping method')
      return
    }
    setError('')
    setStep('review')
  }

  const handlePlaceOrder = async () => {
    if (!selectedShipping) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({ id: item.id, quantity: item.quantity })),
          shippingAddress: form,
          shippingMethod: `${selectedShipping.courier} ${selectedShipping.service}`,
          shippingCost: selectedShipping.price,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || data.details?.map((d: any) => d.message).join(', ') || 'Failed to place order')
      }

      const order = await res.json()
      clearCart()
      router.push(`/checkout/success?orderId=${order.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to place order')
      setSubmitting(false)
    }
  }

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-12">
          {['Address', 'Shipping', 'Review'].map((label, i) => {
            const stepKeys = ['address', 'shipping', 'review'] as const
            const isActive = step === stepKeys[i]
            const isCompleted = stepKeys.indexOf(step) > i
            return (
              <div key={label} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  isCompleted ? 'bg-black text-white' : isActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : i + 1}
                </div>
                <span className={`ml-2 text-sm font-medium ${isActive ? 'text-black' : 'text-gray-500'}`}>
                  {label}
                </span>
                {i < 2 && <div className={`w-16 sm:w-24 h-px mx-3 ${isCompleted ? 'bg-black' : 'bg-gray-200'}`} />}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Address Step */}
        {step === 'address' && (
          <form onSubmit={handleAddressSubmit}>
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Shipping Address</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="shippingName">Full Name *</Label>
                <Input id="shippingName" value={form.shippingName} onChange={e => handleInputChange('shippingName', e.target.value)} placeholder="John Doe" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="shippingPhone">Phone Number *</Label>
                <Input id="shippingPhone" value={form.shippingPhone} onChange={e => handleInputChange('shippingPhone', e.target.value)} placeholder="08xxxxxxxxx" className="mt-1" required />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="shippingAddress">Full Address *</Label>
                <Input id="shippingAddress" value={form.shippingAddress} onChange={e => handleInputChange('shippingAddress', e.target.value)} placeholder="Jl. Example No. 123" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="shippingCity">City *</Label>
                <Input id="shippingCity" value={form.shippingCity} onChange={e => handleInputChange('shippingCity', e.target.value)} placeholder="Jakarta" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="shippingProvince">Province *</Label>
                <Input id="shippingProvince" value={form.shippingProvince} onChange={e => handleInputChange('shippingProvince', e.target.value)} placeholder="DKI Jakarta" className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="shippingPostalCode">Postal Code *</Label>
                <Input id="shippingPostalCode" value={form.shippingPostalCode} onChange={e => handleInputChange('shippingPostalCode', e.target.value)} placeholder="12345" className="mt-1" required />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button type="submit" className="btn-primary" disabled={shippingLoading}>
                {shippingLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Continue to Shipping
              </Button>
            </div>
          </form>
        )}

        {/* Shipping Step */}
        {step === 'shipping' && (
          <form onSubmit={handleShippingSubmit}>
            <div className="flex items-center gap-3 mb-8">
              <Truck className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Shipping Method</h1>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Delivering to: <span className="font-semibold text-black">{form.shippingName}</span>, {form.shippingCity}, {form.shippingProvince}</p>
            </div>

            {shippingOptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No shipping options found. Default rates will apply.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shippingOptions.map((option, i) => (
                  <label
                    key={i}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedShipping?.service === option.service && selectedShipping?.price === option.price
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={selectedShipping?.service === option.service && selectedShipping?.price === option.price}
                        onChange={() => setSelectedShipping(option)}
                        className="w-4 h-4 accent-black"
                      />
                      <div>
                        <p className="font-semibold text-sm">{option.courier} {option.service}</p>
                        <p className="text-xs text-gray-500">Est. {option.estimatedDays} day(s)</p>
                      </div>
                    </div>
                    <p className="font-semibold">Rp {option.price.toLocaleString('id-ID')}</p>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-8 flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep('address')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button type="submit" className="btn-primary">
                Continue to Review
              </Button>
            </div>
          </form>
        )}

        {/* Review Step */}
        {step === 'review' && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Package className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Review Order</h1>
            </div>

            {/* Shipping Info */}
            <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">Shipping Address</h3>
              <p className="text-sm text-gray-700">{form.shippingName}</p>
              <p className="text-sm text-gray-700">{form.shippingPhone}</p>
              <p className="text-sm text-gray-700">{form.shippingAddress}</p>
              <p className="text-sm text-gray-700">{form.shippingCity}, {form.shippingProvince} {form.shippingPostalCode}</p>
            </div>

            {/* Shipping Method */}
            {selectedShipping && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-2">Shipping Method</h3>
                <p className="text-sm text-gray-700">{selectedShipping.courier} {selectedShipping.service} - Est. {selectedShipping.estimatedDays} day(s)</p>
              </div>
            )}

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold mb-4">Order Items</h3>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(Number(item.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping ({selectedShipping?.courier} {selectedShipping?.service})</span>
                <span>Rp {(selectedShipping?.price || 0).toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(Number(subtotal) + (selectedShipping?.price || 0))}</span>
              </div>
              <p className="text-xs text-gray-500">All prices are in Indonesian Rupiah (Rp).</p>
            </div>

            <div className="mt-8 flex justify-between">
              <Button type="button" variant="outline" onClick={() => setStep('shipping')}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handlePlaceOrder} disabled={submitting} className="btn-primary">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Placing Order...</> : 'Place Order'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}