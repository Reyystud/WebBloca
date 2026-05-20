import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, NotFoundError } from '@/lib/error-handler'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    })

    if (!payment || payment.order.userId !== user.id) {
      throw new NotFoundError('Payment not found')
    }

    return NextResponse.json({
      id: payment.id,
      paymentStatus: payment.paymentStatus,
      paymentMethod: payment.paymentMethod,
      paymentUrl: payment.paymentUrl,
      qrCodeUrl: payment.qrCodeUrl,
      amount: Number(payment.amount),
      paidAt: payment.paidAt,
      expiredAt: payment.expiredAt,
      order: {
        id: payment.order.id,
        status: payment.order.status,
        totalAmount: Number(payment.order.totalAmount),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}