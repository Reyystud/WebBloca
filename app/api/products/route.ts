import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, image, category, subCategory, isSale, description, features, stock } = body

    if (!name || price === undefined || !image || !category) {
      return NextResponse.json(
        { error: 'Name, price, image, and category are required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        image,
        category,
        subCategory: subCategory || null,
        isSale: isSale || false,
        description: description || null,
        features: features ? JSON.stringify(features) : null,
        stock: stock || 100,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}