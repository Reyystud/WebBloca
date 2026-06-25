import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError, NotFoundError, ValidationError } from '@/lib/error-handler'

export async function POST(request: Request) {
  try {
    const user = await requireAuth()
    const { orderId, paymentMethod } = await request.json()

    if (!orderId) {
      throw new ValidationError('Order ID is required')
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    })

    if (!order || order.userId !== user.id) {
      throw new NotFoundError('Order not found')
    }

    if (order.paymentStatus === 'PAID') {
      throw new ValidationError('Order is already paid')
    }

    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: order.id, paymentStatus: { in: ['UNPAID', 'PENDING'] } },
      orderBy: { createdAt: 'desc' },
    })

    if (existingPayment?.paymentUrl && existingPayment.paymentStatus === 'PENDING') {
      const expiredAt = existingPayment.expiredAt
      if (expiredAt && new Date(expiredAt) > new Date()) {
        return NextResponse.json({
          paymentId: existingPayment.id,
          paymentUrl: existingPayment.paymentUrl,
          qrCodeUrl: existingPayment.qrCodeUrl,
          paymentStatus: existingPayment.paymentStatus,
        })
      }
    }

    const totalWithShipping = Number(order.totalAmount) + Number(order.shippingCost)

    const { invoiceApi } = await import('@/lib/xendit')

    const invoice = await invoiceApi.createInvoice({
      data: {
        externalId: `bloca-order-${order.id}`,
        amount: totalWithShipping,
        description: `Payment for BLOCA Order #${order.id.slice(-8)}`,
        payerEmail: user.email!,
        successRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?orderId=${order.id}`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/failed?orderId=${order.id}`,
        currency: 'IDR',
        items: order.orderItems.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: Number(item.priceAtPurchase),
        })),
        fees: Number(order.shippingCost) > 0 ? [{
          type: 'SHIPPING',
          value: Number(order.shippingCost),
        }] : undefined,
        paymentMethods: paymentMethod === 'QRIS' ? ['QRIS'] : (paymentMethod === 'BANK_TRANSFER' ? ['BCA', 'BNI', 'BRI', 'MANDIRI', 'PERMATA', 'BSI', 'BJB', 'CIMB'] : undefined),
      },
    })

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        xenditInvoiceId: invoice.id || undefined,
        xenditExternalId: invoice.externalId || undefined,
        amount: totalWithShipping,
        paymentMethod: paymentMethod || 'XENDIT_INVOICE',
        paymentStatus: 'PENDING',
        paymentUrl: invoice.invoiceUrl || undefined,
        qrCodeUrl: undefined,
        expiredAt: invoice.expiryDate ? new Date(invoice.expiryDate) : undefined,
      },
    })

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod || 'XENDIT_INVOICE',
        paymentReference: invoice.id || undefined,
      },
    })

    return NextResponse.json({
      paymentId: payment.id,
      paymentUrl: payment.paymentUrl,
      qrCodeUrl: payment.qrCodeUrl,
      paymentStatus: payment.paymentStatus,
    })
  } catch (error) {
    return handleApiError(error)
  }
}