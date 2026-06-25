const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main() {
  const products = await prisma.product.findMany()
  console.log('Products count:', products.length)
  if (products.length > 0) {
    console.log(products[0])
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
