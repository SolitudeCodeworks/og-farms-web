'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CircleHelp } from 'lucide-react'

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

    const parsedMinQuantity = parseInt(newRule.minQuantity)
    if (Number.isNaN(parsedMinQuantity) || parsedMinQuantity < 2) {
      setMessage('Min quantity must be at least 2')
      return
    }

    const rule = {
      minQuantity: parsedMinQuantity,
      maxQuantity: newRule.maxQuantity ? parseInt(newRule.maxQuantity) : null,
      tierPrice: parseFloat(newRule.tierPrice)
    }

    setRules([...rules, rule].sort((a, b) => a.minQuantity - b.minQuantity))
    setNewRule({ minQuantity: '', maxQuantity: '', tierPrice: '' })
    setMessage('')
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
              <div className="mb-1 flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-300">Min Quantity (g)</label>
                <button
                  type="button"
                  title="Minimum quantity where this tier starts. Must be 2 or higher."
                  className="text-gray-400 hover:text-white"
                  aria-label="Min quantity help"
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
              </div>
              <input
                type="number"
                min="2"
                value={newRule.minQuantity}
                onChange={(e) => setNewRule({...newRule, minQuantity: e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white placeholder:text-gray-400 outline-none focus:border-primary"
                placeholder="e.g. 2"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-300">Max Quantity (g, optional)</label>
                <button
                  type="button"
                  title="Optional upper limit for this tier. Leave empty to make it open-ended."
                  className="text-gray-400 hover:text-white"
                  aria-label="Max quantity help"
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
              </div>
              <input
                type="number"
                min="1"
                value={newRule.maxQuantity}
                onChange={(e) => setNewRule({...newRule, maxQuantity: e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white placeholder:text-gray-400 outline-none focus:border-primary"
                placeholder="Leave empty for open-ended"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-300">Tier Price (R)</label>
                <button
                  type="button"
                  title="Total price charged when cart quantity falls in this tier range."
                  className="text-gray-400 hover:text-white"
                  aria-label="Tier price help"
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
              </div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newRule.tierPrice}
                onChange={(e) => setNewRule({...newRule, tierPrice: e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white placeholder:text-gray-400 outline-none focus:border-primary"
                placeholder="e.g. 100"
              />
            </div>
          </div>
          <button
            onClick={handleAddRule}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary/90"
          >
            Add Tier
          </button>
        </div>

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
