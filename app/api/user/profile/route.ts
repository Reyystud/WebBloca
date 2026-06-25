import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { handleApiError } from '@/lib/error-handler'

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    const { updateProfileSchema } = await import('@/lib/validations')
    const data = updateProfileSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return handleApiError(error)
  }
}
