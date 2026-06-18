import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { handleApiError } from '@/lib/error-handler'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where: any = { isDeleted: false }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { subCategory: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()

    const { createProductSchema } = await import('@/lib/validations')
    const data = createProductSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        image: data.image,
        category: data.category,
        subCategory: data.subCategory ?? null,
        isSale: data.isSale,
        description: data.description ?? null,
        features: data.features ?? undefined,
        stock: data.stock,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}