import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import crypto from 'crypto'
import prisma from '@/lib/prisma'

const XENDIT_WEBHOOK_SECRET = process.env.XENDIT_WEBHOOK_SECRET || ''

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const body = JSON.parse(rawBody)

    if (XENDIT_WEBHOOK_SECRET) {
      const headersList = await headers()
      const xenditSignature = headersList.get('x-callback-token')
      if (!xenditSignature) {
        return NextResponse.json({ error: 'Missing callback token' }, { status: 401 })
      }

      const expectedSignature = crypto
        .createHmac('sha256', XENDIT_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex')

      if (xenditSignature !== expectedSignature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const { id, external_id, status, payment_method, paid_at } = body

    if (!external_id) {
      return NextResponse.json({ error: 'Missing external_id' }, { status: 400 })
    }

    const payment = await prisma.payment.findFirst({
      where: { xenditExternalId: external_id },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (status === 'PAID') {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            paymentStatus: 'PAID',
            paymentMethod: payment_method || payment.paymentMethod,
            paidAt: paid_at ? new Date(paid_at) : new Date(),
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'PAID',
            paymentMethod: payment_method || 'XENDIT_INVOICE',
            paymentPaidAt: paid_at ? new Date(paid_at) : new Date(),
            status: 'PROCESSING',
          },
        }),
      ])
    } else if (status === 'EXPIRED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: 'EXPIRED' },
      })

      const order = await prisma.order.findUnique({
        where: { id: payment.orderId },
        include: { payments: true },
      })

      if (order && !order.payments.some(p => p.paymentStatus === 'PAID')) {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'EXPIRED' },
        })
      }
    } else if (status === 'FAILED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: 'FAILED' },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Xendit callback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}