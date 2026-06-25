const { PrismaClient } = require('./lib/generated/prisma')
const prisma = new PrismaClient()
async function main() {
  const product = await prisma.product.findFirst({
    where: { name: { contains: 'Buggle Bag Charm' } }
  })
  console.log(product)
}
main().catch(console.error).finally(() => prisma.$disconnect())
