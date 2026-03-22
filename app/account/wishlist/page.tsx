import { Heart, Trash2, ShoppingBag } from 'lucide-react'

export default function WishlistPage() {
  // Sample wishlist data
  const wishlistItems = [
    {
      id: '1',
      name: 'Classic Beaded Bracelet',
      price: 49.99,
      addedDate: 'March 10, 2024',
    },
    {
      id: '2',
      name: 'Pearl & Silver Mix',
      price: 59.99,
      addedDate: 'March 5, 2024',
    },
    {
      id: '3',
      name: 'Gemstone Collection',
      price: 69.99,
      addedDate: 'February 28, 2024',
    },
    {
      id: '4',
      name: 'Sustainable Bamboo',
      price: 34.99,
      addedDate: 'February 20, 2024',
    },
    {
      id: '5',
      name: 'Golden Accent Braid',
      price: 64.99,
      addedDate: 'February 15, 2024',
    },
  ]

  return (
    <div className="space-y-6">
      <p className="text-gray-600">
        You have <span className="font-bold">{wishlistItems.length}</span> items saved
      </p>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-semibold mb-2">Your wishlist is empty</p>
          <p className="text-sm text-gray-600 mb-6">
            Save items to your wishlist to view them later
          </p>
          <a
            href="/products"
            className="inline-block btn-primary"
          >
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors flex flex-col"
            >
              {/* Product Image */}
              <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Product Image</p>
              </div>

              {/* Product Info */}
              <h3 className="font-bold text-lg mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
                Added on {item.addedDate}
              </p>

              {/* Price */}
              <p className="text-2xl font-bold mb-6">
                ${item.price.toFixed(2)}
              </p>

              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                  <ShoppingBag size={18} />
                  Add to Cart
                </button>
                <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Wishlist Section */}
      {wishlistItems.length > 0 && (
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Share Your Wishlist</h3>
          <p className="text-gray-600 text-sm mb-4">
            Share this link with friends and family so they can see what you want
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value="https://bloca.com/wishlist/user123"
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            />
            <button className="px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap">
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
