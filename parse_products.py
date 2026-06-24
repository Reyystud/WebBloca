import re
import json

text = """
Wicky	Bracelet	372000
Pillie	Bracelet	162000
The bub	Bracelet	150000
Tita	Bracelet	252000
Pon Pon	Bracelet	192000
Trible	Bracelet	380000
Lacey (Sabrina)	Bracelet	352000
Gaze	Bracelet	388000
Lumi	Bracelet	252000
Swift	Bracelet	182000
Bizi	Bracelet	375000
Lephant	Bracelet	395000
Bilo A	Bracelet	420000
Bilo B	Bracelet	450000
Bon FLora	Bracelet	585000
Bon Claire	Bracelet	697000
Bon Time	Bracelet	500000
Bon Tricks	Bracelet	312000
Bon Classic	Bracelet	352000
Bon Wheel	Bracelet	250000
Piyo Checkmate	Bracelet	600000
3 in 1 bag strap	Bag strap	395000
Solitaire bag strap	Bag strap	450000
Drizzy bag strap	Bag strap	464000
Windle bag strap	Bag strap	900000
Wister bottle strap	Bottle strap	325000
Tubi	Bag charm	217000
Bunny	Bag charm	282000
Skirt	Bag charm	312000
Cat Tail	Bag charm	220000
Pewny	Bag charm	282000
Tumble (Exclusive)	Bag charm	159000
Rear (Exclusive)	Bag charm	515000
Wooble	Bag charm	252000
Leafy	Bag charm	312000
Coup	Bag charm	322000
Brooche A	Brooche	650000
Brooche B	Brooche	550000
Solitaire Lanyard	Lanyard	222000
Wiki wiki Lanyard	Lanyard	252000
Nibble Lanyard	Lanyard	252000
Hokey Pokey	Lanyard	395000
Pay	Handstrap	156000
Vast	Handstrap	212000
Loom	Handstrap	202000
Lite Series	Handstrap	182000
symbi	Handstrap	283000
Biggle	Handstrap	283000
Magneto D	Rings	372000
Bon Gummy	Rings	277000
Love letter	Necklace	452000
Solitaire	Mask strap	158000
Kayne	Mask strap	168000
piyo bracelet	bracelet	550000
Willow handstrap	Handstrap	380000
Piyo sparkle	Bracelet	600000
Ivy bracelet	Bloca homme	363000
Punzel bracelet	Bloca homme	340000
Illuma bracelet	Bloca homme	212000
Solitaire sparkle	Bloca homme	250000
Ballet bag charm	Bloca homme	335000
Lanyard sling new	Bloca homme	312000
KUBO Bracelet	Bloca homme	189000
TOM Bracelet	Bloca homme	162000
KUBO SPORT Bracelet	Bloca homme	189000
BUB Bracelet	Bloca homme	150000
JERICO Bracelet	Bloca homme	222000
Kubub Bracelet	Bloca homme	212000
Bucky bag charm	Bloca homme	252000
BOB bag charm	Bloca homme	187000
WESTERN bag charm	Bloca homme	322000
LA PADDOCK bag charm	Bloca homme	322000
TOM necklace	Bloca homme	182000
STIKO handstrap	Bloca homme	222000
"""

lines = [l for l in text.split('\n') if l.strip()]

images = [
    'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-20-50.webp',
    'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-03.webp',
    'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-06.webp',
    'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-07.webp',
    'Catalog/Restock/BonClaire/PHOTO-2026-04-09-14-21-08.webp',
    'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-35.webp',
    'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-40.webp',
    'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-41.webp',
    'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-42.webp',
    'Catalog/Restock/Bub/PHOTO-2026-04-09-14-23-46.webp',
    'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-25-52.webp',
    'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-25-53.webp',
    'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-26-00.webp',
    'Catalog/Restock/Wicky/PHOTO-2026-04-09-14-26-01.webp',
    'Catalog/Buggle/IMG_20260505_155901-Photoroom.webp',
    'Catalog/Buggle/IMG_20260505_160055-Photoroom.webp',
    'Catalog/Buggle/IMG20260505155557-Photoroom.webp',
    'Catalog/Buggle/IMG20260505155654-Photoroom.webp',
    'Catalog/Buggle/IMG20260505155512-Photoroom.webp',
    'Catalog/Buggle/IMG2026005155803-Photoroom.webp',
    'Model/BalletBagCharm.webp',
    'Model/solitaresparklerings.webp'
]

products = []
for i, line in enumerate(lines):
    parts = line.split('\t')
    if len(parts) >= 3:
        name = parts[0].strip()
        cat = parts[1].strip()
        price = int(parts[2].strip())
        
        # Determine actual category and brand
        # Since the pdf mixes Bloca homme as a category for items, let's fix it
        brand = 'BLOCA'
        actual_cat = cat.capitalize()
        
        if cat.lower() == 'bloca homme':
            brand = 'BLOCA HOMME'
            if 'bracelet' in name.lower():
                actual_cat = 'Bracelet'
            elif 'bag charm' in name.lower():
                actual_cat = 'Bag charm'
            elif 'lanyard' in name.lower():
                actual_cat = 'Lanyard'
            elif 'rings' in name.lower() or 'solitaire sparkle' in name.lower():
                actual_cat = 'Rings'
            elif 'necklace' in name.lower():
                actual_cat = 'Necklace'
            elif 'handstrap' in name.lower():
                actual_cat = 'Handstrap'
            else:
                actual_cat = 'Accessories'

        if actual_cat == 'Bracelet':
            actual_cat = 'Bracelet'
        
        img = images[i % len(images)]
        
        # Determine subcategory loosely
        sub = name.split()[0]
        
        product_id = f"prod-{i+1}"
        
        products.append({
            'id': product_id,
            'name': name,
            'price': price,
            'image': img,
            'category': actual_cat,
            'subCategory': sub,
            'brand': brand
        })

print("Generated", len(products), "products")

# Output to products.ts
ts_code = "export type Product = {\n  id: string\n  name: string\n  price: number\n  image: string\n  category: string\n  subCategory?: string\n  isSale?: boolean\n  description?: string\n  features?: string[]\n  stock?: number\n  brand?: string\n}\n\n"
ts_code += "const LOCAL_PRODUCTS: Product[] = [\n"
for p in products:
    ts_code += f"  {{ id: '{p['id']}', name: '{p['name']}', price: {p['price']}, image: '{p['image']}', category: '{p['category']}', subCategory: '{p['subCategory']}', brand: '{p['brand']}' }},\n"
ts_code += "]\n\n"
ts_code += "export const ALL_PRODUCTS = LOCAL_PRODUCTS\n\n"
ts_code += """function parseProduct(raw: any): Product {
  return {
    ...raw,
    features: raw.features
      ? typeof raw.features === 'string'
        ? JSON.parse(raw.features)
        : raw.features
      : undefined,
    isSale: raw.isSale ?? false,
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      return data.map(parseProduct)
    }
  } catch {
    // Fall back to local data
  }
  return LOCAL_PRODUCTS
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const res = await fetch(`/api/products/${id}`, { cache: 'no-store' })
    if (res.ok) {
      return parseProduct(await res.json())
    }
  } catch {
    // Fall back to local data
  }
  return LOCAL_PRODUCTS.find((p) => p.id === id)
}
"""

with open('lib/products.ts', 'w') as f:
    f.write(ts_code)

# Output to seed.ts
seed_code = "import { PrismaClient } from '../lib/generated/prisma'\n\nconst prisma = new PrismaClient()\n\n"
seed_code += "const products = [\n"
for p in products:
    seed_code += f"  {{ id: '{p['id']}', name: '{p['name']}', price: {p['price']}, image: '{p['image']}', category: '{p['category']}', subCategory: '{p['subCategory']}', brand: '{p['brand']}' }},\n"
seed_code += "]\n\n"
seed_code += """async function main() {
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
"""

with open('prisma/seed.ts', 'w') as f:
    f.write(seed_code)

print("Files updated.")
