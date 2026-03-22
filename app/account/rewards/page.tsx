import { Gift, TrendingUp, Zap, Award } from 'lucide-react'

export default function RewardsPage() {
  const currentTier = 'Gold'
  const currentPoints = 2450
  const nextTierPoints = 3000

  const tiers = [
    {
      name: 'Silver',
      minPoints: 0,
      benefits: ['3% off all purchases', 'Free shipping on orders $75+'],
      reached: true,
    },
    {
      name: 'Gold',
      minPoints: 1000,
      benefits: ['5% off all purchases', 'Free shipping on all orders', 'Early access to new releases'],
      reached: true,
    },
    {
      name: 'Platinum',
      minPoints: 3000,
      benefits: ['10% off all purchases', 'Free express shipping', 'VIP customer support', 'Exclusive gifts'],
      reached: false,
    },
  ]

  const recentActivity = [
    { date: 'March 15, 2024', description: 'Purchase reward', points: 75, type: 'earn' },
    { date: 'March 10, 2024', description: 'Birthday bonus', points: 50, type: 'earn' },
    { date: 'March 5, 2024', description: 'Purchase reward', points: 45, type: 'earn' },
    { date: 'February 28, 2024', description: 'Referral reward', points: 100, type: 'earn' },
  ]

  return (
    <div className="space-y-8">
      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Gift size={24} className="text-yellow-600" />
            <p className="text-sm font-semibold text-yellow-700">CURRENT POINTS</p>
          </div>
          <p className="text-4xl font-bold text-yellow-900">{currentPoints}</p>
          <p className="text-xs text-yellow-700 mt-2">1 point = $0.01 discount</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={24} className="text-blue-600" />
            <p className="text-sm font-semibold text-blue-700">CURRENT TIER</p>
          </div>
          <p className="text-4xl font-bold text-blue-900">{currentTier}</p>
          <p className="text-xs text-blue-700 mt-2">Next: Platinum</p>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={24} className="text-purple-600" />
            <p className="text-sm font-semibold text-purple-700">PROGRESS</p>
          </div>
          <p className="text-4xl font-bold text-purple-900">{((currentPoints / nextTierPoints) * 100).toFixed(0)}%</p>
          <p className="text-xs text-purple-700 mt-2">{nextTierPoints - currentPoints} points to go</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-bold text-lg mb-4">Path to Platinum</h3>
        <div className="flex items-center gap-4 mb-4">
          {tiers.map((tier, index) => (
            <div key={tier.name} className="flex-1 text-center">
              <div
                className={`h-12 rounded-lg flex items-center justify-center font-bold mb-2 transition-all ${
                  tier.reached
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {tier.name}
              </div>
              <p className="text-xs text-gray-600">{tier.minPoints} pts</p>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
          <div
            className="bg-black h-full transition-all duration-300"
            style={{ width: `${(currentPoints / nextTierPoints) * 100}%` }}
          />
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Membership Tiers</h2>
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`p-6 border-2 rounded-lg transition-all ${
              tier.reached
                ? 'border-black bg-white'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{tier.name}</h3>
                  {tier.reached && <Award size={20} className="text-black" />}
                </div>
                <p className="text-sm text-gray-600">
                  Requires {tier.minPoints} points
                </p>
              </div>
              {tier.name === currentTier && (
                <span className="px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                  Current Tier
                </span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 mb-3">Benefits:</p>
              <ul className="space-y-2">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-black font-bold mt-1">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-semibold">{activity.description}</p>
                <p className="text-sm text-gray-600">{activity.date}</p>
              </div>
              <p className={`text-lg font-bold ${activity.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                {activity.type === 'earn' ? '+' : '-'}{activity.points}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Earn */}
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-bold text-lg mb-4">How to Earn Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <span className="text-2xl font-bold text-black">1x</span>
            <div>
              <p className="font-semibold text-sm">Every Purchase</p>
              <p className="text-xs text-gray-600">1 point per $1 spent</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl font-bold text-black">2x</span>
            <div>
              <p className="font-semibold text-sm">Referrals</p>
              <p className="text-xs text-gray-600">When friends sign up</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl font-bold text-black">50</span>
            <div>
              <p className="font-semibold text-sm">Birthday Bonus</p>
              <p className="text-xs text-gray-600">Gift just for you</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-2xl font-bold text-black">5x</span>
            <div>
              <p className="font-semibold text-sm">Special Events</p>
              <p className="text-xs text-gray-600">Limited time offers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
