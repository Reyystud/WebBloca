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

    const { updateOrderStatusSchema } = await import('@/lib/validations')
    const data = updateOrderStatusSchema.parse(body)

    const order = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true }
    })

    if (!order) {
      throw new NotFoundError('Order not found')
    }

    // Only allow users to update their own order, or admins to update any order
    if (order.userId !== user.id && user.role !== 'ADMIN') {
      throw new NotFoundError('Order not found')
    }

    // If cancelling, restore stock
    if (data.status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.orderItems) {
          if (!item.productId) continue
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          })
        }
        await tx.order.update({
          where: { id },
          data: { status: 'CANCELLED' }
        })
      })
      return NextResponse.json({ success: true, status: 'CANCELLED' })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
        ...(data.trackingNumber !== undefined && { trackingNumber: data.trackingNumber }),
        ...(data.trackingProvider !== undefined && { trackingProvider: data.trackingProvider }),
        ...(data.shippingAddress && { shippingAddress: data.shippingAddress }),
      },
    })
    return NextResponse.json(updated)
  } catch (error) {
    return handleApiError(error)
  }
}