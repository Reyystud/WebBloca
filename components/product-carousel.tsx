'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './product-card'

interface Product {
  id: string
  name: string
  price: number
  image: string
  isBestSeller?: boolean
}

interface ProductCarouselProps {
  title: string
  products: Product[]
}

export default function ProductCarousel({ title, products }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      })

      setTimeout(checkScroll, 300)
    }
  }

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold">{title}</h2>
          
          {/* Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-hidden">
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[85%] sm:w-1/2 md:w-1/3 lg:w-1/4 snap-start"
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
