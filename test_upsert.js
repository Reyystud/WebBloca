const { PrismaClient } = require('./lib/generated/prisma')
const prisma = new PrismaClient()
async function main() {
  const userId = '3935494f-0c96-46bf-8b1a-377c6cab8481' // The user experiencing the issue
  const productId = 'bc-bu-1' // Buggle Bag Charm

  // Try what /api/cart/merge does:
  const cartItem = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: { increment: 1 } },
    create: {
      userId: userId,
      productId: productId,
      quantity: 1,
    },
  })
  console.log(cartItem)
}
main().catch(console.error).finally(() => prisma.$disconnect())
