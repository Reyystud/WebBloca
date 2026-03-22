import { Package, Calendar, DollarSign, Truck } from 'lucide-react'

export default function OrdersPage() {
  // Sample order data
  const orders = [
    {
      id: '#BLC001',
      date: 'March 15, 2024',
      total: 149.97,
      status: 'Delivered',
      items: 3,
      image: 'Order 1',
    },
    {
      id: '#BLC002',
      date: 'March 8, 2024',
      total: 89.98,
      status: 'Delivered',
      items: 2,
      image: 'Order 2',
    },
    {
      id: '#BLC003',
      date: 'February 28, 2024',
      total: 199.95,
      status: 'Delivered',
      items: 4,
      image: 'Order 3',
    },
  ]

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-50 text-yellow-700 border-yellow-200',
    'Processing': 'bg-blue-50 text-blue-700 border-blue-200',
    'Shipped': 'bg-blue-50 text-blue-700 border-blue-200',
    'Delivered': 'bg-green-50 text-green-700 border-green-200',
    'Cancelled': 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        You have <span className="font-bold">{orders.length}</span> orders
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-semibold mb-2">No orders yet</p>
          <p className="text-sm text-gray-600 mb-6">
            Start shopping to see your orders here
          </p>
          <a
            href="/products"
            className="inline-block btn-primary"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Order Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <p className="text-xs text-gray-400">{order.image}</p>
                </div>

                {/* Order Details */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{order.id}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>{order.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package size={16} />
                          <span>{order.items} items</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[order.status]}`}>
                      {order.status}
                    </div>
                  </div>

                  {/* Order Amount */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                      <DollarSign size={18} className="text-gray-600" />
                      <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                        View Details
                      </button>
                      {order.status === 'Delivered' && (
                        <button className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
