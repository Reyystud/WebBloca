import type { Metadata } from 'next'
import AccountSidebar from '@/components/account/sidebar'

export const metadata: Metadata = {
  title: 'My Account - BLOCA',
  description: 'Manage your BLOCA account, orders, and preferences.',
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12">
        <h1 className="text-4xl sm:text-5xl font-bold mb-12">My Account</h1>
        
        <div className="flex gap-12">
          <AccountSidebar />
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
