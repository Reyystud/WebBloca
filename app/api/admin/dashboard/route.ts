import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

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
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { orderItems: { include: { product: true } }, user: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalOrders,
      totalUsers,
      totalProducts,
      recentOrders,
      ordersByStatus,
    })
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 })
    }
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}