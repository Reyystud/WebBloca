import HeroSection from '@/components/hero-section'
import ProductCarousel from '@/components/product-carousel'
import BrandStory from '@/components/brand-story'
import { ALL_PRODUCTS } from '@/lib/products'

export default function Home() {
  // Use a selection of products for the home page
  const featuredProducts = ALL_PRODUCTS.slice(0, 8).map(p => ({
    ...p,
    isBestSeller: p.id.includes('bc-1') || p.id.includes('bub-1')
  }))

  return (
    <main className="bg-white overflow-x-hidden w-full">
      <HeroSection />
      <ProductCarousel title="Trending Now" products={featuredProducts} />
      <BrandStory />
    </main>
  )
}
