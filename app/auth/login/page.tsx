import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Sign In - BLOCA',
  description: 'Sign in to your BLOCA account to access your orders and wishlist.',
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-block mb-8 font-bold text-2xl hover:opacity-60 transition-opacity">
              BLOCA
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
