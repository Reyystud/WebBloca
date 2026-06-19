import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

const products = [
  { id: 'prod-1', name: 'Wicky', price: 372000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-20-50.jpg', category: 'Bracelet', subCategory: 'Wicky'},
  { id: 'prod-2', name: 'Pillie', price: 162000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-03.jpg', category: 'Bracelet', subCategory: 'Pillie'},
  { id: 'prod-3', name: 'The bub', price: 150000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-06.jpg', category: 'Bracelet', subCategory: 'The'},
  { id: 'prod-4', name: 'Tita', price: 252000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-07.jpg', category: 'Bracelet', subCategory: 'Tita'},
  { id: 'prod-5', name: 'Pon Pon', price: 192000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-08.jpg', category: 'Bracelet', subCategory: 'Pon'},
  { id: 'prod-6', name: 'Trible', price: 380000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-35.jpg', category: 'Bracelet', subCategory: 'Trible'},
  { id: 'prod-7', name: 'Lacey (Sabrina)', price: 352000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-40.jpg', category: 'Bracelet', subCategory: 'Lacey'},
  { id: 'prod-8', name: 'Gaze', price: 388000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-41.jpg', category: 'Bracelet', subCategory: 'Gaze'},
  { id: 'prod-9', name: 'Lumi', price: 252000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-42.jpg', category: 'Bracelet', subCategory: 'Lumi'},
  { id: 'prod-10', name: 'Swift', price: 182000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-46.jpg', category: 'Bracelet', subCategory: 'Swift'},
  { id: 'prod-11', name: 'Bizi', price: 375000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-25-52.jpg', category: 'Bracelet', subCategory: 'Bizi'},
  { id: 'prod-12', name: 'Lephant', price: 395000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-25-53.jpg', category: 'Bracelet', subCategory: 'Lephant'},
  { id: 'prod-13', name: 'Bilo A', price: 420000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-26-00.jpg', category: 'Bracelet', subCategory: 'Bilo'},
  { id: 'prod-14', name: 'Bilo B', price: 450000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-26-01.jpg', category: 'Bracelet', subCategory: 'Bilo'},
  { id: 'prod-15', name: 'Bon FLora', price: 585000, image: 'Catalog/Buggle/IMG_20260505_155901-Photoroom.jpg', category: 'Bracelet', subCategory: 'Bon'},
  { id: 'prod-16', name: 'Bon Claire', price: 697000, image: 'Catalog/Buggle/IMG_20260505_160055-Photoroom.jpg', category: 'Bracelet', subCategory: 'Bon'},
  { id: 'prod-17', name: 'Bon Time', price: 500000, image: 'Catalog/Buggle/IMG20260505155557-Photoroom.jpg', category: 'Bracelet', subCategory: 'Bon'},
  { id: 'prod-18', name: 'Bon Tricks', price: 312000, image: 'Catalog/Buggle/IMG20260505155654-Photoroom.jpg', category: 'Bracelet', subCategory: 'Bon'},
  { id: 'prod-19', name: 'Bon Classic', price: 352000, image: 'Catalog/Buggle/IMG20260505155512-Photoroom.jpg', category: 'Bracelet', subCategory: 'Bon'},
  { id: 'prod-20', name: 'Bon Wheel', price: 250000, image: 'Catalog/Buggle/IMG2026005155803-Photoroom.jpg', category: 'Bracelet', subCategory: 'Bon'},
  { id: 'prod-21', name: 'Piyo Checkmate', price: 600000, image: 'Model/BalletBagCharm.jpeg', category: 'Bracelet', subCategory: 'Piyo'},
  { id: 'prod-22', name: '3 in 1 bag strap', price: 395000, image: 'Model/solitaresparklerings.jpeg', category: 'Bag strap', subCategory: '3'},
  { id: 'prod-23', name: 'Solitaire bag strap', price: 450000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-20-50.jpg', category: 'Bag strap', subCategory: 'Solitaire'},
  { id: 'prod-24', name: 'Drizzy bag strap', price: 464000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-03.jpg', category: 'Bag strap', subCategory: 'Drizzy'},
  { id: 'prod-25', name: 'Windle bag strap', price: 900000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-06.jpg', category: 'Bag strap', subCategory: 'Windle'},
  { id: 'prod-26', name: 'Wister bottle strap', price: 325000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-07.jpg', category: 'Bottle strap', subCategory: 'Wister'},
  { id: 'prod-27', name: 'Tubi', price: 217000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-08.jpg', category: 'Bag charm', subCategory: 'Tubi'},
  { id: 'prod-28', name: 'Bunny', price: 282000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-35.jpg', category: 'Bag charm', subCategory: 'Bunny'},
  { id: 'prod-29', name: 'Skirt', price: 312000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-40.jpg', category: 'Bag charm', subCategory: 'Skirt'},
  { id: 'prod-30', name: 'Cat Tail', price: 220000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-41.jpg', category: 'Bag charm', subCategory: 'Cat'},
  { id: 'prod-31', name: 'Pewny', price: 282000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-42.jpg', category: 'Bag charm', subCategory: 'Pewny'},
  { id: 'prod-32', name: 'Tumble (Exclusive)', price: 159000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-46.jpg', category: 'Bag charm', subCategory: 'Tumble'},
  { id: 'prod-33', name: 'Rear (Exclusive)', price: 515000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-25-52.jpg', category: 'Bag charm', subCategory: 'Rear'},
  { id: 'prod-34', name: 'Wooble', price: 252000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-25-53.jpg', category: 'Bag charm', subCategory: 'Wooble'},
  { id: 'prod-35', name: 'Leafy', price: 312000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-26-00.jpg', category: 'Bag charm', subCategory: 'Leafy'},
  { id: 'prod-36', name: 'Coup', price: 322000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-26-01.jpg', category: 'Bag charm', subCategory: 'Coup'},
  { id: 'prod-37', name: 'Brooche A', price: 650000, image: 'Catalog/Buggle/IMG_20260505_155901-Photoroom.jpg', category: 'Brooche', subCategory: 'Brooche'},
  { id: 'prod-38', name: 'Brooche B', price: 550000, image: 'Catalog/Buggle/IMG_20260505_160055-Photoroom.jpg', category: 'Brooche', subCategory: 'Brooche'},
  { id: 'prod-39', name: 'Solitaire Lanyard', price: 222000, image: 'Catalog/Buggle/IMG20260505155557-Photoroom.jpg', category: 'Lanyard', subCategory: 'Solitaire'},
  { id: 'prod-40', name: 'Wiki wiki Lanyard', price: 252000, image: 'Catalog/Buggle/IMG20260505155654-Photoroom.jpg', category: 'Lanyard', subCategory: 'Wiki'},
  { id: 'prod-41', name: 'Nibble Lanyard', price: 252000, image: 'Catalog/Buggle/IMG20260505155512-Photoroom.jpg', category: 'Lanyard', subCategory: 'Nibble'},
  { id: 'prod-42', name: 'Hokey Pokey', price: 395000, image: 'Catalog/Buggle/IMG2026005155803-Photoroom.jpg', category: 'Lanyard', subCategory: 'Hokey'},
  { id: 'prod-43', name: 'Pay', price: 156000, image: 'Model/BalletBagCharm.jpeg', category: 'Handstrap', subCategory: 'Pay'},
  { id: 'prod-44', name: 'Vast', price: 212000, image: 'Model/solitaresparklerings.jpeg', category: 'Handstrap', subCategory: 'Vast'},
  { id: 'prod-45', name: 'Loom', price: 202000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-20-50.jpg', category: 'Handstrap', subCategory: 'Loom'},
  { id: 'prod-46', name: 'Lite Series', price: 182000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-03.jpg', category: 'Handstrap', subCategory: 'Lite'},
  { id: 'prod-47', name: 'symbi', price: 283000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-06.jpg', category: 'Handstrap', subCategory: 'symbi'},
  { id: 'prod-48', name: 'Biggle', price: 283000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-07.jpg', category: 'Handstrap', subCategory: 'Biggle'},
  { id: 'prod-49', name: 'Magneto D', price: 372000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-08.jpg', category: 'Rings', subCategory: 'Magneto'},
  { id: 'prod-50', name: 'Bon Gummy', price: 277000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-35.jpg', category: 'Rings', subCategory: 'Bon'},
  { id: 'prod-51', name: 'Love letter', price: 452000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-40.jpg', category: 'Necklace', subCategory: 'Love'},
  { id: 'prod-52', name: 'Solitaire', price: 158000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-41.jpg', category: 'Mask strap', subCategory: 'Solitaire'},
  { id: 'prod-53', name: 'Kayne', price: 168000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-42.jpg', category: 'Mask strap', subCategory: 'Kayne'},
  { id: 'prod-54', name: 'piyo bracelet', price: 550000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-46.jpg', category: 'Bracelet', subCategory: 'piyo'},
  { id: 'prod-55', name: 'Willow handstrap', price: 380000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-25-52.jpg', category: 'Handstrap', subCategory: 'Willow'},
  { id: 'prod-56', name: 'Piyo sparkle', price: 600000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-25-53.jpg', category: 'Bracelet', subCategory: 'Piyo'},
  { id: 'prod-57', name: 'Ivy bracelet', price: 363000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-26-00.jpg', category: 'Bracelet', subCategory: 'Ivy'},
  { id: 'prod-58', name: 'Punzel bracelet', price: 340000, image: 'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-26-01.jpg', category: 'Bracelet', subCategory: 'Punzel'},
  { id: 'prod-59', name: 'Illuma bracelet', price: 212000, image: 'Catalog/Buggle/IMG_20260505_155901-Photoroom.jpg', category: 'Bracelet', subCategory: 'Illuma'},
  { id: 'prod-60', name: 'Solitaire sparkle', price: 250000, image: 'Catalog/Buggle/IMG_20260505_160055-Photoroom.jpg', category: 'Rings', subCategory: 'Solitaire'},
  { id: 'prod-61', name: 'Ballet bag charm', price: 335000, image: 'Catalog/Buggle/IMG20260505155557-Photoroom.jpg', category: 'Bag charm', subCategory: 'Ballet'},
  { id: 'prod-62', name: 'Lanyard sling new', price: 312000, image: 'Catalog/Buggle/IMG20260505155654-Photoroom.jpg', category: 'Lanyard', subCategory: 'Lanyard'},
  { id: 'prod-63', name: 'KUBO Bracelet', price: 189000, image: 'Catalog/Buggle/IMG20260505155512-Photoroom.jpg', category: 'Bracelet', subCategory: 'KUBO'},
  { id: 'prod-64', name: 'TOM Bracelet', price: 162000, image: 'Catalog/Buggle/IMG2026005155803-Photoroom.jpg', category: 'Bracelet', subCategory: 'TOM'},
  { id: 'prod-65', name: 'KUBO SPORT Bracelet', price: 189000, image: 'Model/BalletBagCharm.jpeg', category: 'Bracelet', subCategory: 'KUBO'},
  { id: 'prod-66', name: 'BUB Bracelet', price: 150000, image: 'Model/solitaresparklerings.jpeg', category: 'Bracelet', subCategory: 'BUB'},
  { id: 'prod-67', name: 'JERICO Bracelet', price: 222000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-20-50.jpg', category: 'Bracelet', subCategory: 'JERICO'},
  { id: 'prod-68', name: 'Kubub Bracelet', price: 212000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-03.jpg', category: 'Bracelet', subCategory: 'Kubub'},
  { id: 'prod-69', name: 'Bucky bag charm', price: 252000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-06.jpg', category: 'Bag charm', subCategory: 'Bucky'},
  { id: 'prod-70', name: 'BOB bag charm', price: 187000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-07.jpg', category: 'Bag charm', subCategory: 'BOB'},
  { id: 'prod-71', name: 'WESTERN bag charm', price: 322000, image: 'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-08.jpg', category: 'Bag charm', subCategory: 'WESTERN'},
  { id: 'prod-72', name: 'LA PADDOCK bag charm', price: 322000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-35.jpg', category: 'Bag charm', subCategory: 'LA'},
  { id: 'prod-73', name: 'TOM necklace', price: 182000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-40.jpg', category: 'Necklace', subCategory: 'TOM'},
  { id: 'prod-74', name: 'STIKO handstrap', price: 222000, image: 'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-41.jpg', category: 'Handstrap', subCategory: 'STIKO'},
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
