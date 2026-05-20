import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { handleApiError } from '@/lib/error-handler'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: true,
        payments: true,
      },
    })

    if (!order) {
      const { NotFoundError } = await import('@/lib/error-handler')
      throw new NotFoundError('Order not found')
    }

    return NextResponse.json(order)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await request.json()

    const { updateOrderStatusSchema } = await import('@/lib/validations')
    const data = updateOrderStatusSchema.parse(body)

    const order = await prisma.order.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
        ...(data.trackingNumber !== undefined && { trackingNumber: data.trackingNumber }),
        ...(data.trackingProvider !== undefined && { trackingProvider: data.trackingProvider }),
        ...(data.shippingAddress !== undefined && { shippingAddress: data.shippingAddress }),
        ...(data.paymentStatus === 'PAID' && { paymentPaidAt: new Date() }),
      },
      include: {
        user: true,
        orderItems: true,
        payments: true,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    return handleApiError(error)
  }
}