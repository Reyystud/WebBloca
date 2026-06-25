const { PrismaClient } = require('./lib/generated/prisma')
const prisma = new PrismaClient()
async function main() {
  const result = await prisma.product.updateMany({
    data: {
      stock: 1
    }
  })
  console.log('Updated products:', result.count)
}
main().catch(console.error).finally(() => prisma.$disconnect())
