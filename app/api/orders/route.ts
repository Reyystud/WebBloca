import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth()

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        orderItems: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { shippingAddress } = await request.json()

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount,
        shippingAddress: shippingAddress || null,
        orderItems: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
        },
      },
      include: { orderItems: { include: { product: true } } },
    })

    await prisma.cartItem.deleteMany({ where: { userId: user.id } })

    // Award points: 1 point per dollar spent
    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: Math.floor(totalAmount) } },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}