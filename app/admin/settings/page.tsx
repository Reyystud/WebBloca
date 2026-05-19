'use client'

import { useState } from 'react'
import { Save } from 'lucide-react'

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [settings, setSettings] = useState({
    storeName: 'BLOCA',
    storeDescription: 'Premium, handmade bracelets crafted with care. Sustainable, artisan-made jewelry from Indonesia.',
    freeShippingThreshold: '100',
    currency: 'USD',
    contactEmail: 'hello@bloca.com',
    instagramUrl: 'https://instagram.com/bloca',
  })

  const handleSave = async () => {
    setSaving(true)
    setSuccess('')
    // In production, this would save to a settings table or config
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSaving(false)
    setSuccess('Settings saved successfully')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-bold">Store Information</h2>

        <div>
          <label className="block text-sm font-semibold mb-2">Store Name</label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Store Description</label>
          <textarea
            value={settings.storeDescription}
            onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Contact Email</label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Instagram URL</label>
          <input
            type="url"
            value={settings.instagramUrl}
            onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-bold">Shipping & Pricing</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Free Shipping Threshold ($)</label>
            <input
              type="number"
              step="0.01"
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Currency</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black transition-colors"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="IDR">IDR - Indonesian Rupiah</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        <Save size={18} />
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}