'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ProductBulkPricingPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [rules, setRules] = useState<any[]>([])
  const [newRule, setNewRule] = useState({
    minQuantity: '',
    maxQuantity: '',
    tierPrice: ''
  })
  const [unlimited, setUnlimited] = useState(false)
  const [showUnlimitedWarning, setShowUnlimitedWarning] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchRules()
  }, [productId])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/products/${productId}/bulk-pricing`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data.product)
        setRules(data.rules)
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error)
      setMessage('Failed to load bulk pricing rules')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRule = () => {
    if (!newRule.minQuantity || !newRule.tierPrice) {
      setMessage('Min quantity and tier price required')
      return
    }

    const rule = {
      minQuantity: parseInt(newRule.minQuantity),
      maxQuantity: unlimited ? null : (newRule.maxQuantity ? parseInt(newRule.maxQuantity) : null),
      tierPrice: parseFloat(newRule.tierPrice)
    }

    setRules([...rules, rule].sort((a, b) => a.minQuantity - b.minQuantity))
    setNewRule({ minQuantity: '', maxQuantity: '', tierPrice: '' })
    setUnlimited(false)
    setMessage('')
  }

  const handleUnlimitedChange = (checked: boolean) => {
    if (checked) {
      setShowUnlimitedWarning(true)
      return
    }

    setUnlimited(false)
    setNewRule((prev) => ({ ...prev, maxQuantity: '' }))
  }

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (rules.length === 0) {
      setMessage('At least one pricing tier required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/bulk-pricing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
      })

      if (res.ok) {
        setMessage('✓ Bulk pricing rules saved successfully')
        await fetchRules()
      } else {
        const error = await res.json()
        setMessage(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Save failed:', error)
      setMessage('Failed to save rules')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Pricing Rules</h1>
        <p className="text-gray-400">
          {product?.name} ({product?.category})
        </p>
        <p className="text-sm text-gray-500 mt-1">Base price: R{product?.price}</p>
      </div>

      {message && (
        <div className={`mb-4 rounded-lg border p-4 ${message.includes('✓') ? 'border-green-500/30 bg-green-500/10 text-green-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 mb-6 shadow-2xl">
        <h2 className="text-lg font-semibold mb-4 text-white">Current Pricing Tiers</h2>
        
        {rules.length > 0 ? (
          <div className="space-y-2 mb-6">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <div className="flex-1">
                  <span className="font-mono text-sm text-gray-200">
                    {rule.maxQuantity ? `${rule.minQuantity}g - ${rule.maxQuantity}g` : `${rule.minQuantity}g+`} → R{rule.tierPrice}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveRule(idx)}
                  className="ml-4 text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-6 text-gray-400">No pricing tiers configured yet</p>
        )}

        <div className="border-t border-zinc-800 pt-6">
          <h3 className="font-semibold mb-4 text-white">Add New Tier</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Min Quantity (g)</label>
              <input
                type="number"
                min="1"
                value={newRule.minQuantity}
                onChange={(e) => setNewRule({...newRule, minQuantity: e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-primary"
                placeholder="e.g. 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Max Quantity (g, optional)</label>
              <div className="space-y-3 rounded-lg border border-zinc-700 bg-zinc-950 p-3">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-200">
                  <input
                    type="checkbox"
                    checked={unlimited}
                    onChange={(e) => handleUnlimitedChange(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-600 text-primary focus:ring-primary"
                  />
                  Unlimited
                </label>
                <input
                  type="number"
                  min="1"
                  value={newRule.maxQuantity}
                  onChange={(e) => setNewRule({...newRule, maxQuantity: e.target.value})}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-gray-500"
                  placeholder={unlimited ? 'Unlimited selected' : 'Leave empty for unlimited'}
                  disabled={unlimited}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">Tier Price (R)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newRule.tierPrice}
                onChange={(e) => setNewRule({...newRule, tierPrice: e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-primary"
                placeholder="e.g. 100"
              />
            </div>
          </div>
          <button
            onClick={handleAddRule}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-black hover:bg-primary/90"
          >
            Add Tier
          </button>
        </div>

        {showUnlimitedWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-2">Unlimited bulk tier</h3>
              <p className="text-sm text-gray-400 mb-5">
                Unlimited means the bulk price only covers the minimum bundle size.
                Any units above that minimum are charged at the regular product price.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setUnlimited(true)
                    setNewRule((prev) => ({ ...prev, maxQuantity: '' }))
                    setShowUnlimitedWarning(false)
                  }}
                  className="flex-1 rounded-lg bg-primary px-4 py-3 font-semibold text-black hover:bg-primary/90"
                >
                  I Understand
                </button>
                <button
                  onClick={() => setShowUnlimitedWarning(false)}
                  className="flex-1 rounded-lg bg-zinc-800 px-4 py-3 font-semibold text-white hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          onClick={() => router.back()}
          className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 rounded font-semibold hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
