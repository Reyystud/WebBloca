const { PrismaClient } = require('./lib/generated/prisma')
const prisma = new PrismaClient()
async function main() {
  const user = await prisma.user.findFirst()
  console.log('User ID:', user?.id)
  if (user) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    })
    console.log('Cart count for user:', cartItems.length)
    console.log(cartItems)
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
