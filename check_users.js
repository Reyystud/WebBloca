const { PrismaClient } = require('./lib/generated/prisma')
const prisma = new PrismaClient()
async function main() {
  const users = await prisma.user.findMany()
  console.log('Total users:', users.length)
  for (const u of users) {
    const carts = await prisma.cartItem.findMany({ where: { userId: u.id } })
    console.log(`User ${u.id} (${u.email}) has ${carts.length} cart items.`)
  }
}
main().catch(console.error).finally(() => prisma.$disconnect())
