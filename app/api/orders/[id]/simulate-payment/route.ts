import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, NotFoundError } from '@/lib/error-handler'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const user = await requireAuth()
    const { method } = await request.json()

    const order = await prisma.order.findUnique({
      where: { id },
    })

    if (!order || order.userId !== user.id) {
      throw new NotFoundError('Order not found')
    }

    // Mark as PAID
    await prisma.order.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        paymentMethod: method || 'MOCK_PAYMENT',
        paymentPaidAt: new Date(),
        status: 'PROCESSING' // Automatically move to processing
      },
    })

    // Also update any pending payment records
    await prisma.payment.updateMany({
      where: { 
        orderId: id,
        paymentStatus: 'PENDING'
      },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
