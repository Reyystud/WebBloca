import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { handleApiError } from '@/lib/error-handler'

export async function GET() {
  try {
    await requireAdmin()

    const [
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders,
      ordersByStatus,
      ordersByPaymentStatus,
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count({ where: { isDeleted: false } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { orderItems: true, user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.order.groupBy({
        by: ['paymentStatus'],
        _count: { paymentStatus: true },
      }),
    ])

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders,
      ordersByStatus,
      ordersByPaymentStatus,
    })
  } catch (error) {
    return handleApiError(error)
  }
}