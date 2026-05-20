import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import CartDrawer from '@/components/cart-drawer'
import { CartProvider } from '@/context/cart-context'
import { AuthProvider } from '@/context/auth-context'

const geist = Geist({ subsets: ["latin"], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'BLOCA - Handcrafted Bracelets',
  description: 'Premium, handmade bracelets crafted with care. Sustainable, artisan-made jewelry from Indonesia.',
  icons: {
    icon: '/logobloca.jpeg',
    apple: '/logobloca.jpeg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-white text-black">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}