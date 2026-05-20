import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { handleApiError, NotFoundError } from '@/lib/error-handler'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: { orderItems: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { orders: true, wishlistItems: true, cartItems: true } },
      },
    })

    if (!user) {
      throw new NotFoundError('User not found')
    }

    return NextResponse.json(user)
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

    const { updateUserSchema } = await import('@/lib/validations')
    const data = updateUserSchema.parse(body)

    const user = await prisma.user.update({
      where: { id },
      data,
    })

    return NextResponse.json(user)
  } catch (error) {
    return handleApiError(error)
  }
}