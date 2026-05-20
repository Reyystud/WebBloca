import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

const products = [
  { id: 'b-bc-1', name: 'Bon Claire Classic', price: 199999, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-20-50.jpg', category: 'Bracelet', subCategory: 'Bon Claire', description: 'A timeless piece featuring classic beads and a minimalist design. Perfect for everyday wear.', features: ['Handcrafted', 'Premium Beads', 'Adjustable Size'] },
  { id: 'b-bc-2', name: 'Bon Claire Elegance', price: 249999, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-03.jpg', category: 'Bracelet', subCategory: 'Bon Claire', isSale: true, description: 'Elevate your style with the Bon Claire Elegance. Featuring high-shine accents.', features: ['High-Shine Accent', 'Durable Thread', 'Limited Edition'] },
  { id: 'b-bc-3', name: 'Bon Claire Pearl', price: 199999, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-06.jpg', category: 'Bracelet', subCategory: 'Bon Claire' },
  { id: 'b-bc-4', name: 'Bon Claire Gold Accent', price: 299999, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-07.jpg', category: 'Bracelet', subCategory: 'Bon Claire', isSale: true },
  { id: 'b-bc-5', name: 'Bon Claire Minimal', price: 149999, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-08.jpg', category: 'Bracelet', subCategory: 'Bon Claire' },
  { id: 'b-bub-1', name: 'Bub Minimalist', price: 149999, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-35.jpg', category: 'Bracelet', subCategory: 'Bub' },
  { id: 'b-bub-2', name: 'Bub Thread', price: 129999, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-40.jpg', category: 'Bracelet', subCategory: 'Bub', isSale: true },
  { id: 'b-bub-3', name: 'Bub Sky Blue', price: 149999, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-41.jpg', category: 'Bracelet', subCategory: 'Bub' },
  { id: 'b-bub-4', name: 'Bub Forest Green', price: 149999, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-42.jpg', category: 'Bracelet', subCategory: 'Bub' },
  { id: 'b-bub-5', name: 'Bub Sunset Orange', price: 129999, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-46.jpg', category: 'Bracelet', subCategory: 'Bub', isSale: true },
  { id: 'b-w-1', name: 'Wicky Charm', price: 179999, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-25-52.jpg', category: 'Bracelet', subCategory: 'Wicky' },
  { id: 'b-w-2', name: 'Wicky Star', price: 199999, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-25-53.jpg', category: 'Bracelet', subCategory: 'Wicky', isSale: true },
  { id: 'b-w-3', name: 'Wicky Moon', price: 199999, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-26-00.jpg', category: 'Bracelet', subCategory: 'Wicky' },
  { id: 'b-w-4', name: 'Wicky Heart', price: 199999, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-26-01.jpg', category: 'Bracelet', subCategory: 'Wicky', isSale: true },
  { id: 'ps-bu-1', name: 'Buggle Pearl Strap', price: 129999, image: 'Catalog/Buggle/IMG_20260505_155901-Photoroom.jpg', category: 'Phone strap', subCategory: 'Buggle' },
  { id: 'ps-bu-2', name: 'Buggle Crystal Strap', price: 149999, image: 'Catalog/Buggle/IMG_20260505_160055-Photoroom.jpg', category: 'Phone strap', subCategory: 'Buggle', isSale: true },
  { id: 'ps-bu-3', name: 'Buggle Pastel Mix', price: 139999, image: 'Catalog/Buggle/IMG20260505155557-Photoroom.jpg', category: 'Phone strap', subCategory: 'Buggle' },
  { id: 'ps-bu-4', name: 'Buggle Ocean Blue', price: 139999, image: 'Catalog/Buggle/IMG20260505155654-Photoroom.jpg', category: 'Phone strap', subCategory: 'Buggle', isSale: true },
  { id: 'ps-ba-1', name: 'Basic Black Strap', price: 79999, image: 'Catalog/Buggle/IMG20260505155512-Photoroom.jpg', category: 'Phone strap', subCategory: 'Basic' },
  { id: 'ps-ba-2', name: 'Basic White Strap', price: 79999, image: 'Catalog/Buggle/IMG2026005155803-Photoroom.jpg', category: 'Phone strap', subCategory: 'Basic' },
  { id: 'bc-bt-1', name: 'Ballet Ribbon Charm', price: 149999, image: 'Model/BalletBagCharm.jpeg', category: 'Bag charm', subCategory: 'Ballet' },
  { id: 'bc-sp-1', name: 'Sparkle Heart Charm', price: 169999, image: 'Model/solitaresparklerings.jpeg', category: 'Bag charm', subCategory: 'Sparkle' },
  { id: 'bc-bu-1', name: 'Buggle Bag Charm', price: 139999, image: 'Catalog/Buggle/IMG20260505155955-Photoroom.jpg', category: 'Bag charm', subCategory: 'Ballet', isSale: true },
  { id: 'kc-si-1', name: 'Silver Star Keychain', price: 59999, image: 'Catalog/Buggle/IMG_20260505_160318-Photoroom.jpg', category: 'Keychain', subCategory: 'Silver' },
  { id: 'kc-be-1', name: 'Beaded Flower Keychain', price: 89999, image: 'Catalog/Buggle/IMG20260505161005-Photoroom.jpg', category: 'Keychain', subCategory: 'Beaded' },
  { id: 'kc-bu-1', name: 'Buggle Mascot Keychain', price: 79999, image: 'Catalog/Buggle/IMG20260505160214-Photoroom.jpg', category: 'Keychain', subCategory: 'Beaded', isSale: true },
  { id: 'kc-gl-1', name: 'Glow in Dark Keychain', price: 99999, image: 'Catalog/Buggle/IMG20260505160412-Photoroom.jpg', category: 'Keychain', subCategory: 'Silver' },
]

async function main() {
  console.log('Seeding database...')

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: product,
      create: product,
    })
  }

  console.log(`Seeded ${products.length} products.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })