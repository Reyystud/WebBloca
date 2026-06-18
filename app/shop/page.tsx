'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/product-card'
import { ChevronRight } from 'lucide-react'
import { ALL_PRODUCTS } from '@/lib/products'

const BLOCA_CATEGORIES = [
  'All item',
  'Sale item',
  'Bracelet',
  'Phone strap',
  'Bag charm',
  'Keychain'
]

const BLOCA_HOMME_CATEGORIES = [
  'Bracelet',
  'Phone strap',
  'Keychain'
]

const SUB_CATEGORIES: Record<string, string[]> = {
  'Bracelet': ['Bon Claire', 'Bub', 'Wicky'],
  'Phone strap': ['Buggle', 'Basic'],
  'Bag charm': ['Ballet', 'Sparkle'],
  'Keychain': ['Silver', 'Beaded']
}

function ShopContent() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState('All item')
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const [brand, setBrand] = useState('BLOCA')

  useEffect(() => {
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const search = searchParams.get('search')

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

  const filteredProducts = brand === 'BLOCA HOMME' ? [] : ALL_PRODUCTS.filter(product => {
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
    } else {
      matchesCategory = product.category === selectedCategory
    }

    if (!matchesCategory) return false

    if (selectedSubCategory) {
      return product.subCategory?.toLowerCase() === selectedSubCategory.toLowerCase()
    }

    return true
  })

  return (
    <div className="bg-white min-h-screen pt-16">
      {/* Moving Text Banner */}
      <div className="bg-black text-white py-2.5 overflow-hidden whitespace-nowrap border-b border-black">
        <div className="inline-block animate-marquee">
          <span className="mx-4 text-[10px] font-bold tracking-[0.3em] uppercase">Christmas Sale up to 40% OFF — Limited Time Only — Free Shipping on Orders Over $50 — Christmas Sale up to 40% OFF — Limited Time Only — Free Shipping on Orders Over $50 — </span>
        </div>
        <div className="inline-block animate-marquee" aria-hidden="true">
          <span className="mx-4 text-[10px] font-bold tracking-[0.3em] uppercase">Christmas Sale up to 40% OFF — Limited Time Only — Free Shipping on Orders Over $50 — Christmas Sale up to 40% OFF — Limited Time Only — Free Shipping on Orders Over $50 — </span>
        </div>
      </div>

      {/* Brand Selection Navbar */}
      <div className="flex justify-center border-b border-gray-100 bg-white sticky top-[64px] z-30">
        <div className="flex gap-8 sm:gap-16 py-4">
          <button 
            onClick={() => handleBrandChange('BLOCA')}
            className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-all relative py-2 ${
              brand === 'BLOCA' ? 'text-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            BLOCA
            {brand === 'BLOCA' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
            )}
          </button>
          <button 
            onClick={() => handleBrandChange('BLOCA HOMME')}
            className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-all relative py-2 ${
              brand === 'BLOCA HOMME' ? 'text-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            BLOCA HOMME
            {brand === 'BLOCA HOMME' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black" />
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
                        ? 'text-black font-semibold translate-x-1' 
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    {category}
                    {selectedCategory === category && SUB_CATEGORIES[category] && brand === 'BLOCA' && (
                      <ChevronRight size={14} className="text-black" />
                    )}
                  </button>

                  {/* Branching Sub-categories (Only for BLOCA for now) */}
                  {selectedCategory === category && SUB_CATEGORIES[category] && brand === 'BLOCA' && (
                    <div className="mt-4 ml-4 flex flex-col space-y-3 border-l border-gray-100 pl-4 py-1">
                      <button
                        onClick={() => setSelectedSubCategory(null)}
                        className={`text-xs tracking-wider transition-colors text-left ${
                          selectedSubCategory === null ? 'text-black font-medium' : 'text-gray-400 hover:text-black'
                        }`}
                      >
                        Show All
                      </button>
                      {SUB_CATEGORIES[category].map(sub => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubCategory(sub)}
                          className={`text-xs tracking-wider transition-colors text-left ${
                            selectedSubCategory === sub ? 'text-black font-medium' : 'text-gray-400 hover:text-black'
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
                <h1 className="text-3xl font-light tracking-tight text-gray-900 capitalize">
                  {searchQuery ? `Search: ${searchQuery}` : (brand === 'BLOCA HOMME' ? `HOMME ${selectedCategory.toLowerCase()}` : selectedCategory.toLowerCase())}
                </h1>
                {!searchQuery && brand !== 'BLOCA HOMME' && selectedSubCategory && (
                  <>
                    <span className="text-gray-300 text-2xl font-thin">/</span>
                    <span className="text-xl font-light text-gray-500">{selectedSubCategory}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-3 font-light tracking-wide">
                Showing {filteredProducts.length} items
              </p>
            </header>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                  />
                ))}
              </div>
            ) : (
              <div className="py-32 flex flex-col items-center justify-center border border-dashed border-gray-100 rounded-2xl">
                <p className="text-gray-400 font-light italic text-center px-4">
                  {searchQuery 
                    ? `No products found for "${searchQuery}".`
                    : (brand === 'BLOCA HOMME' 
                        ? `The BLOCA HOMME ${selectedCategory.toLowerCase()} collection is coming soon.` 
                        : 'No products available in this selection.')}
                </p>
                {(brand !== 'BLOCA HOMME' || searchQuery) && (
                  <button 
                    onClick={() => {setSelectedCategory('All item'); setSelectedSubCategory(null); setSearchQuery(null);}}
                    className="mt-4 text-xs underline underline-offset-4 text-gray-900 hover:opacity-60 transition-opacity"
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
