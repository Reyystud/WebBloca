import { PrismaClient } from './lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database image migration...')
  
  const products = await prisma.product.findMany()
  let productCount = 0
  for (const p of products) {
    if (p.image && (p.image.endsWith('.jpg') || p.image.endsWith('.png') || p.image.endsWith('.jpeg') || p.image.includes('.jpg?') || p.image.includes('.png?'))) {
      const newImage = p.image.replace(/\.(jpg|png|jpeg)(\?.*)?$/i, '.webp')
      await prisma.product.update({
        where: { id: p.id },
        data: { image: newImage }
      })
      productCount++
    }
  }
  console.log(`Updated ${productCount} products.`)

  const orderItems = await prisma.orderItem.findMany()
  let orderItemCount = 0
  for (const oi of orderItems) {
    if (oi.productImage && (oi.productImage.endsWith('.jpg') || oi.productImage.endsWith('.png') || oi.productImage.endsWith('.jpeg') || oi.productImage.includes('.jpg?') || oi.productImage.includes('.png?'))) {
      const newImage = oi.productImage.replace(/\.(jpg|png|jpeg)(\?.*)?$/i, '.webp')
      await prisma.orderItem.update({
        where: { id: oi.id },
        data: { productImage: newImage }
      })
      orderItemCount++
    }
  }
  console.log(`Updated ${orderItemCount} order items.`)
}

main()
  .then(() => console.log('Migration complete.'))
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
