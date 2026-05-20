import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { handleApiError } from '@/lib/error-handler'

const FLAT_RATES = [
  { city: 'Jakarta', province: 'DKI Jakarta', courier: 'JNE', service: 'REG', price: 15000, estimatedDays: '2-3' },
  { city: 'Jakarta', province: 'DKI Jakarta', courier: 'JNE', service: 'YES', price: 25000, estimatedDays: '1' },
  { city: 'Bandung', province: 'Jawa Barat', courier: 'JNE', service: 'REG', price: 18000, estimatedDays: '2-3' },
  { city: 'Bandung', province: 'Jawa Barat', courier: 'JNE', service: 'YES', price: 30000, estimatedDays: '1' },
  { city: 'Surabaya', province: 'Jawa Timur', courier: 'JNE', service: 'REG', price: 25000, estimatedDays: '3-4' },
  { city: 'Surabaya', province: 'Jawa Timur', courier: 'JNE', service: 'YES', price: 40000, estimatedDays: '1-2' },
  { city: 'Semarang', province: 'Jawa Tengah', courier: 'JNE', service: 'REG', price: 22000, estimatedDays: '3-4' },
  { city: 'Semarang', province: 'Jawa Tengah', courier: 'JNE', service: 'YES', price: 35000, estimatedDays: '1-2' },
  { city: 'Yogyakarta', province: 'DI Yogyakarta', courier: 'JNE', service: 'REG', price: 22000, estimatedDays: '3-4' },
  { city: 'Yogyakarta', province: 'DI Yogyakarta', courier: 'JNE', service: 'YES', price: 35000, estimatedDays: '1-2' },
  { city: 'Medan', province: 'Sumatera Utara', courier: 'JNE', service: 'REG', price: 35000, estimatedDays: '4-5' },
  { city: 'Makassar', province: 'Sulawesi Selatan', courier: 'JNE', service: 'REG', price: 40000, estimatedDays: '4-6' },
  { city: 'Denpasar', province: 'Bali', courier: 'JNE', service: 'REG', price: 30000, estimatedDays: '3-4' },
  { city: 'Malang', province: 'Jawa Timur', courier: 'JNE', service: 'REG', price: 25000, estimatedDays: '3-4' },
  { city: 'Palembang', province: 'Sumatera Selatan', courier: 'JNE', service: 'REG', price: 32000, estimatedDays: '4-5' },
]

export async function POST(request: Request) {
  try {
    const { city } = await request.json()

    if (!city) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 })
    }

    const dbRates = await prisma.shippingRate.findMany({
      where: { city: { contains: city, mode: 'insensitive' } },
    })

    if (dbRates.length > 0) {
      return NextResponse.json(dbRates)
    }

    const matched = FLAT_RATES.filter(r =>
      r.city.toLowerCase().includes(city.toLowerCase())
    )

    if (matched.length > 0) {
      return NextResponse.json(matched)
    }

    const defaultRates = [
      { city, province: '', courier: 'JNE', service: 'REG', price: 25000, estimatedDays: '3-5' },
      { city, province: '', courier: 'JNE', service: 'YES', price: 40000, estimatedDays: '1-2' },
    ]

    return NextResponse.json(defaultRates)
  } catch (error) {
    return handleApiError(error)
  }
}