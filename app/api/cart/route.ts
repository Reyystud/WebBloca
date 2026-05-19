import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await requireAuth()

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    })

    const formatted = cartItems.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { productId, quantity } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId: user.id, productId },
      },
      update: { quantity: { increment: quantity || 1 } },
      create: {
        userId: user.id,
        productId,
        quantity: quantity || 1,
      },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth()
    const { productId } = await request.json()

    if (productId) {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id, productId },
      })
    } else {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}