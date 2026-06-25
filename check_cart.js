const { PrismaClient } = require('./lib/generated/prisma')
const prisma = new PrismaClient()
async function main() {
  const carts = await prisma.cartItem.findMany()
  console.log('Cart count:', carts.length)
  console.log(carts)
}
main().catch(console.error).finally(() => prisma.$disconnect())
