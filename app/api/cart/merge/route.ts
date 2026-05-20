import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/error-handler'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { mergeCartSchema } = await import('@/lib/validations')
    const data = mergeCartSchema.parse(body)

    const results = []

    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } })
      if (!product || product.isDeleted) continue

      const cartItem = await prisma.cartItem.upsert({
        where: { userId_productId: { userId: user.id, productId: item.id } },
        update: { quantity: { increment: item.quantity } },
        create: {
          userId: user.id,
          productId: item.id,
          quantity: item.quantity,
        },
      })
      results.push(cartItem)
    }

    const allCartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    })

    const formatted = allCartItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    return handleApiError(error)
  }
}