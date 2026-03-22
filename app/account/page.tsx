import { User, MapPin, Phone, Mail } from 'lucide-react'

export default function DashboardPage() {
  // Sample user data
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 000-0000',
    address: '123 Main Street, City, State 12345',
    tier: 'Gold',
    points: 2450,
  }

  const tierColors: Record<string, string> = {
    Silver: 'bg-gray-200 text-gray-800',
    Gold: 'bg-yellow-100 text-yellow-800',
    Platinum: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="space-y-8">
      {/* Profile Card */}
      <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold">Profile Information</h2>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm">
            Edit Profile
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Name */}
          <div>
            <p className="text-sm text-gray-600 mb-1 font-semibold">Full Name</p>
            <p className="text-lg">{user.name}</p>
          </div>

          {/* Email */}
          <div>
            <p className="text-sm text-gray-600 mb-1 font-semibold">Email</p>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-gray-500" />
              <p className="text-lg">{user.email}</p>
            </div>
          </div>

          {/* Phone */}
          <div>
            <p className="text-sm text-gray-600 mb-1 font-semibold">Phone</p>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-gray-500" />
              <p className="text-lg">{user.phone}</p>
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="text-sm text-gray-600 mb-1 font-semibold">Address</p>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-gray-500" />
              <p className="text-lg">{user.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Card */}
      <div className="bg-black text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-8">BLOCA Rewards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tier Badge */}
          <div>
            <p className="text-sm text-gray-300 mb-3 font-semibold">MEMBERSHIP TIER</p>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full font-bold text-sm ${tierColors[user.tier]}`}>
                {user.tier}
              </span>
              <div>
                <p className="text-xs text-gray-300">Next tier: Platinum</p>
                <p className="text-sm font-semibold">550 points away</p>
              </div>
            </div>
          </div>

          {/* Points */}
          <div>
            <p className="text-sm text-gray-300 mb-3 font-semibold">REWARD POINTS</p>
            <p className="text-4xl font-bold">{user.points}</p>
            <p className="text-xs text-gray-300 mt-1">1 point = $0.01 discount</p>
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-300 mb-4 font-semibold">GOLD MEMBER BENEFITS</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">✓</span>
              <span>5% off all purchases</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">✓</span>
              <span>Free shipping on all orders</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">✓</span>
              <span>Early access to new releases</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 font-bold">✓</span>
              <span>Birthday gift</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="/account/orders"
          className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-bold text-lg mb-2">Recent Orders</h3>
          <p className="text-sm text-gray-600">View and track your purchases</p>
        </a>

        <a
          href="/account/wishlist"
          className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <h3 className="font-bold text-lg mb-2">Wishlist</h3>
          <p className="text-sm text-gray-600">5 items saved for later</p>
        </a>
      </div>
    </div>
  )
}
