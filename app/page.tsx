import HeroSection from '@/components/hero-section'
import ProductCarousel from '@/components/product-carousel'
import BrandStory from '@/components/brand-story'

// Sample product data
const bestSellerProducts = [
  {
    id: '1',
    name: 'Classic Beaded Bracelet',
    price: 49.99,
    image: 'classic-beaded',
    isBestSeller: true,
  },
  {
    id: '2',
    name: 'Minimalist Thread Wrap',
    price: 39.99,
    image: 'minimalist-thread',
    isBestSeller: true,
  },
  {
    id: '3',
    name: 'Pearl & Silver Mix',
    price: 59.99,
    image: 'pearl-silver',
    isBestSeller: true,
  },
  {
    id: '4',
    name: 'Handwoven Fiber',
    price: 44.99,
    image: 'handwoven-fiber',
    isBestSeller: false,
  },
  {
    id: '5',
    name: 'Gemstone Collection',
    price: 69.99,
    image: 'gemstone',
    isBestSeller: true,
  },
  {
    id: '6',
    name: 'Bronze & Leather',
    price: 54.99,
    image: 'bronze-leather',
    isBestSeller: false,
  },
  {
    id: '7',
    name: 'Sustainable Bamboo',
    price: 34.99,
    image: 'bamboo',
    isBestSeller: false,
  },
  {
    id: '8',
    name: 'Golden Accent Braid',
    price: 64.99,
    image: 'golden-braid',
    isBestSeller: true,
  },
]

export default function Home() {
  return (
    <main className="bg-white">
      <HeroSection />
      <ProductCarousel title="Trending Now" products={bestSellerProducts} />
      <BrandStory />
    </main>
  )
}
