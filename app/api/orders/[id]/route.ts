import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const { id } = await params
    const body = await request.json()

    // Update cart item quantity
    if (body.quantity !== undefined) {
      if (body.quantity <= 0) {
        await prisma.cartItem.deleteMany({
          where: { id },
        })
        return NextResponse.json({ success: true })
      }

      const updated = await prisma.cartItem.update({
        where: { id },
        data: { quantity: body.quantity },
      })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: 'No update data provided' }, { status: 400 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}