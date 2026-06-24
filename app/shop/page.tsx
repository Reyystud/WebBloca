'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/product-card'
import { ChevronRight } from 'lucide-react'
import { ALL_PRODUCTS } from '@/lib/products'
import { useTheme } from '@/context/theme-context'

const BLOCA_CATEGORIES = [
  'All item',
  'Best seller',
  'Sale item',
  'Bracelet',
  'Bag charm',
  'Lanyard',
  'Handstrap',
  'Rings',
  'Necklace',
  'Bag strap',
  'Bottle strap',
  'Mask strap',
  'Brooche'
]

const BLOCA_HOMME_CATEGORIES = [
  'Bracelet',
  'Bag charm',
  'Necklace',
  'Handstrap'
]

const SUB_CATEGORIES: Record<string, string[]> = {
  'Bracelet': ['Bon', 'Bub', 'Wicky', 'Piyo', 'Bilo'],
  'Bag charm': ['Ballet', 'Sparkle', 'Tumble', 'Rear'],
  'Lanyard': ['Solitaire', 'Wiki', 'Nibble'],
  'Handstrap': ['Pay', 'Vast', 'Loom', 'Lite Series']
}

function ShopContent() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('All item')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const [brand, setBrand] = useState('BLOCA')
  const { setIsDark } = useTheme()

  useEffect(() => {
    setIsDark(brand === 'BLOCA HOMME')
    return () => setIsDark(false)
  }, [brand, setIsDark])

  useEffect(() => {
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const search = searchParams.get('search')
    const brandParam = searchParams.get('brand')

    let currentBrand = 'BLOCA'
    if (brandParam) {
      const isHomme = brandParam.toLowerCase() === 'bloca homme' || brandParam.toLowerCase() === 'homme'
      currentBrand = isHomme ? 'BLOCA HOMME' : 'BLOCA'
    } else if (category && category.toLowerCase() === 'bloca homme') {
      currentBrand = 'BLOCA HOMME'
    }
    
    setBrand(currentBrand)

    setSearchQuery(search)

    if (category) {
      // Find the actual case-sensitive category name
      const matchedCategory = BLOCA_CATEGORIES.find(c => c.toLowerCase() === category.toLowerCase())
      if (matchedCategory) {
        setSelectedCategory(matchedCategory)
      } else if (category.toLowerCase() === 'sale') {
        setSelectedCategory('Sale item')
      }
    } else {
      setSelectedCategory('All item')
    }

    if (subcategory) {
      setSelectedSubCategory(subcategory)
    } else {
      setSelectedSubCategory(null)
    }
  }, [searchParams])

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand)
    // Set default category for the brand
    if (newBrand === 'BLOCA HOMME') {
      setSelectedCategory('Bracelet')
    } else {
      setSelectedCategory('All item')
    }
    setSelectedSubCategory(null)
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category)
    setSelectedSubCategory(null)
  }

  const currentCategories = brand === 'BLOCA' ? BLOCA_CATEGORIES : BLOCA_HOMME_CATEGORIES

  const filteredProducts = ALL_PRODUCTS.filter(product => {
    // Hide custom category from shopping page entirely
    if (product.category.toLowerCase() === 'custom') {
      return false
    }

    // Filter by brand first unless there's a global search
    if (!searchQuery && product.brand !== brand) {
      return false
    }

    // If there's a search query, prioritize it and ignore category/brand filters for now
    // OR should it be search WITHIN the category? Usually search is global.
    // The PRD says "search from any page", so global search makes sense.
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.subCategory?.toLowerCase().includes(query)
      
      if (!matchesSearch) return false
    }

    let matchesCategory = false
    if (selectedCategory === 'All item') {
      matchesCategory = true
    } else if (selectedCategory === 'Sale item') {
      matchesCategory = !!product.isSale
    } else if (selectedCategory === 'Best seller') {
      matchesCategory = true
    } else {
      matchesCategory = product.category === selectedCategory
    }

    if (!matchesCategory) return false

    if (selectedSubCategory) {
      return product.subCategory?.toLowerCase() === selectedSubCategory.toLowerCase()
    }

    return true
  })

  const finalProducts = selectedCategory === 'Best seller' && !searchQuery
    ? filteredProducts.slice(0, 4)
    : filteredProducts

  return (
    <div className="bg-white dark:bg-[#0f0f0f] min-h-screen pt-16 transition-colors duration-500">
      {/* Moving Text Banner */}
      <div className="bg-black dark:bg-white text-white dark:text-black py-2.5 overflow-hidden whitespace-nowrap border-b border-black dark:border-white">
        <div className="inline-block animate-marquee">
          <span className="mx-4 text-[10px] font-bold tracking-[0.3em] uppercase">Christmas Sale up to 40% OFF — Limited Time Only — Free Shipping on Orders Over $50 — Christmas Sale up to 40% OFF — Limited Time Only — Free Shipping on Orders Over $50 — </span>
        </div>
        <div className="inline-block animate-marquee" aria-hidden="true">
          <span className="mx-4 text-[10px] font-bold tracking-[0.3em] uppercase">Christmas Sale up to 40% OFF — Limited Time Only — Free Shipping on Orders Over $50 — Christmas Sale up to 40% OFF — Limited Time Only — Free Shipping on Orders Over $50 — </span>
        </div>
      </div>

      {/* Brand Selection Navbar */}
      <div className="flex justify-center border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0f0f0f] sticky top-[64px] z-30 transition-colors duration-500">
        <div className="flex gap-8 sm:gap-16 py-4">
          <button 
            onClick={() => handleBrandChange('BLOCA')}
            className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-all relative py-2 ${
              brand === 'BLOCA' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white'
            }`}
          >
            BLOCA
            {brand === 'BLOCA' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white" />
            )}
          </button>
          <button 
            onClick={() => handleBrandChange('BLOCA HOMME')}
            className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-all relative py-2 ${
              brand === 'BLOCA HOMME' ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white'
            }`}
          >
            BLOCA HOMME
            {brand === 'BLOCA HOMME' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white" />
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="flex flex-col md:flex-row gap-16">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-56 shrink-0">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase mb-10 text-gray-400">Categories</h2>
            
            <nav className="flex flex-col space-y-6">
              {currentCategories.map(category => (
                <div key={category} className="group">
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={`text-sm tracking-wide transition-all duration-300 flex items-center gap-2 ${
                      selectedCategory === category 
                        ? 'text-black dark:text-white font-semibold translate-x-1' 
                        : 'text-gray-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {category}
                    {SUB_CATEGORIES[category] && brand === 'BLOCA' && (
                      <ChevronRight size={14} className={`transition-transform duration-300 ${selectedCategory === category ? 'rotate-90 text-black dark:text-white' : 'text-gray-400 group-hover:text-black dark:group-hover:text-white'}`} />
                    )}
                  </button>

                  {/* Branching Sub-categories (Only for BLOCA for now) */}
                  {SUB_CATEGORIES[category] && brand === 'BLOCA' && (
                    <div className={`ml-4 flex flex-col space-y-3 border-l border-gray-100 dark:border-gray-800 pl-4 py-1 overflow-hidden transition-all duration-300 ${
                      selectedCategory === category ? 'mt-4 max-h-40 opacity-100' : 'max-h-0 opacity-0 group-hover:mt-4 group-hover:max-h-40 group-hover:opacity-100'
                    }`}>
                      <button
                        onClick={() => { setSelectedCategory(category); setSelectedSubCategory(null); }}
                        className={`text-xs tracking-wider transition-colors text-left ${
                          selectedSubCategory === null && selectedCategory === category ? 'text-black dark:text-white font-medium' : 'text-gray-400 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        Show All
                      </button>
                      {SUB_CATEGORIES[category].map(sub => (
                        <button
                          key={sub}
                          onClick={() => { setSelectedCategory(category); setSelectedSubCategory(sub); }}
                          className={`text-xs tracking-wider transition-colors text-left ${
                            selectedSubCategory === sub && selectedCategory === category ? 'text-black dark:text-white font-medium' : 'text-gray-400 hover:text-black dark:hover:text-white'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {/* Product Feed */}
          <main className="flex-1">
            <header className="mb-12">
              <div className="flex items-baseline gap-4">
                <h1 className="text-3xl font-light tracking-tight text-gray-900 dark:text-white capitalize">
                  {searchQuery ? `Search: ${searchQuery}` : (brand === 'BLOCA HOMME' ? `HOMME ${selectedCategory.toLowerCase()}` : selectedCategory.toLowerCase())}
                </h1>
                {!searchQuery && brand !== 'BLOCA HOMME' && selectedSubCategory && (
                  <>
                    <span className="text-gray-300 dark:text-gray-700 text-2xl font-thin">/</span>
                    <span className="text-xl font-light text-gray-500 dark:text-gray-400">{selectedSubCategory}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-3 font-light tracking-wide">
                Showing {finalProducts.length} items
              </p>
            </header>

            {finalProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {finalProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    isBestSeller={selectedCategory === 'Best seller'}
                  />
                ))}
              </div>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center border border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                <p className="text-gray-400 font-light italic text-center px-4">
                  {searchQuery 
                    ? `No products found for "${searchQuery}".`
                    : 'No products available in this selection.'}
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => {setSelectedCategory('All item'); setSelectedSubCategory(null); setSearchQuery(null);}}
                    className="mt-4 text-xs underline underline-offset-4 text-gray-900 dark:text-gray-200 hover:opacity-60 transition-opacity"
                  >
                    View all products
                  </button>
                )}
              </div>
            )}
          </main>

        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  )
}
