'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'

const CATEGORIES = ['Bracelet', 'Bag charm', 'Handstrap', 'Lanyard']
const SUB_CATEGORIES: Record<string, string[]> = {
  'Bracelet': ['Bon', 'Bub', 'Wicky', 'Piyo', 'Bilo'],
  'Bag charm': ['Ballet', 'Sparkle', 'Tumble', 'Rear'],
  'Handstrap': ['Pay', 'Vast', 'Loom', 'Lite Series'],
  'Lanyard': ['Solitaire', 'Wiki', 'Nibble'],
}

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  subCategory: string | null
  description: string | null
  features: string | string[] | null
  isSale: boolean
  stock: number
}

export default function EditProductPage() {
  const router = useRouter()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    price: '',
    image: '',
    category: 'Bracelet',
    subCategory: '',
    description: '',
    features: '',
    isSale: false,
    stock: '100',
  })

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data: Product) => {
        setForm({
          name: data.name,
          price: data.price.toString(),
          image: data.image,
          category: data.category,
          subCategory: data.subCategory || '',
          description: data.description || '',
          features: Array.isArray(data.features)
            ? data.features.join(', ')
            : typeof data.features === 'string'
              ? (() => { try { return JSON.parse(data.features).join(', ') } catch { return data.features } })()
              : '',
          isSale: data.isSale,
          stock: data.stock.toString(),
        })
      })
      .catch(console.error)
  }, [id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setForm((prev) => ({ ...prev, image: data.url }))
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price),
          image: form.image,
          category: form.category,
          subCategory: form.subCategory || null,
          description: form.description || null,
          features: form.features ? form.features.split(',').map((f) => f.trim()) : null,
          isSale: form.isSale,
          stock: parseInt(form.stock),
        }),
      })

      if (!res.ok) throw new Error('Failed to update product')

      router.push('/admin/products')
    } catch (err: any) {
      setError(err.message || 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold">Edit Product</h1>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-gray-200 p-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Product Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Price *</label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Stock</label>
            <input
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: '' })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
              required
            >
              <option value="" disabled>Select Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Sub Category</label>
            <select
              value={form.subCategory}
              onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors disabled:opacity-50 disabled:bg-gray-50"
              disabled={!form.category}
            >
              <option value="">{form.category ? 'None / Select Sub Category' : 'Select Category First'}</option>
              {(SUB_CATEGORIES[form.category] || []).map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Image</label>
          <div className="flex items-center gap-4">
            {form.image ? (
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <img src={form.image.startsWith('/') ? form.image : `/${form.image}`} alt="Product" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Upload size={24} className="text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
              {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              <p className="text-xs text-gray-400 mt-1">Or enter URL manually:</p>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Features</label>
          <input
            type="text"
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            placeholder="Handcrafted, Premium Beads, Adjustable Size (comma separated)"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isSale"
            checked={form.isSale}
            onChange={(e) => setForm({ ...form, isSale: e.target.checked })}
            className="w-4 h-4 border-gray-300 rounded"
          />
          <label htmlFor="isSale" className="text-sm font-medium">On Sale</label>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}