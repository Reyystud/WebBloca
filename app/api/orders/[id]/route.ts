import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, NotFoundError, ValidationError } from '@/lib/error-handler'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
        payments: true,
      },
    })

    if (!order || order.userId !== user.id) {
      throw new NotFoundError('Order not found')
    }

    return NextResponse.json(order)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    const { updateCartItemSchema } = await import('@/lib/validations')
    const data = updateCartItemSchema.parse(body)

    const cartItem = await prisma.cartItem.findUnique({ where: { id } })
    if (!cartItem || cartItem.userId !== user.id) {
      throw new NotFoundError('Cart item not found')
    }

    if (data.quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } })
      return NextResponse.json({ success: true })
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: data.quantity },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}