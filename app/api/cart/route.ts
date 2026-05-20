import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, NotFoundError, ValidationError } from '@/lib/error-handler'

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
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { addToCartSchema } = await import('@/lib/validations')
    const data = addToCartSchema.parse(body)

    const product = await prisma.product.findUnique({ where: { id: data.productId } })
    if (!product || product.isDeleted) {
      throw new NotFoundError('Product not found')
    }

    if (product.stock < 1) {
      throw new ValidationError('Product is out of stock')
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId: data.productId } },
    })

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + data.quantity
      if (newQuantity > product.stock) {
        throw new ValidationError(`Only ${product.stock} items available. You already have ${existingCartItem.quantity} in your cart.`)
      }
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId: user.id, productId: data.productId },
      },
      update: { quantity: { increment: data.quantity } },
      create: {
        userId: user.id,
        productId: data.productId,
        quantity: data.quantity,
      },
    })

    return NextResponse.json(cartItem)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { removeFromCartSchema } = await import('@/lib/validations')
    const data = removeFromCartSchema.parse(body)

    if (data.productId) {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id, productId: data.productId },
      })
    } else {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}