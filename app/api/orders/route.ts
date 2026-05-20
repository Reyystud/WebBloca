import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, ValidationError } from '@/lib/error-handler'

export async function GET() {
  try {
    const user = await requireAuth()

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        orderItems: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { createOrderSchema } = await import('@/lib/validations')
    const data = createOrderSchema.parse(body)

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      throw new ValidationError('Cart is empty')
    }

    for (const item of cartItems) {
      if (item.product.isDeleted) {
        throw new ValidationError(`Product "${item.product.name}" is no longer available`)
      }
      if (item.quantity > item.product.stock) {
        throw new ValidationError(`Not enough stock for "${item.product.name}". Available: ${item.product.stock}`)
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      )
      const shippingCost = data.shippingCost ?? 0

      for (const item of cartItems) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (!product || product.stock < item.quantity) {
          throw new ValidationError(`Not enough stock for "${item.product.name}"`)
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      const order = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          shippingCost,
          shippingName: data.shippingAddress.shippingName,
          shippingPhone: data.shippingAddress.shippingPhone,
          shippingAddress: data.shippingAddress.shippingAddress,
          shippingCity: data.shippingAddress.shippingCity,
          shippingProvince: data.shippingAddress.shippingProvince,
          shippingPostalCode: data.shippingAddress.shippingPostalCode,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productImage: item.product.image,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            })),
          },
        },
        include: { orderItems: true },
      })

      await tx.cartItem.deleteMany({ where: { userId: user.id } })

      await tx.user.update({
        where: { id: user.id },
        data: { points: { increment: Math.floor(totalAmount) } },
      })

      return order
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}