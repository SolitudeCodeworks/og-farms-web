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
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bulk Pricing Rules</h1>
        <p className="text-gray-600">
          {product?.name} ({product?.category})
        </p>
        <p className="text-sm text-gray-500 mt-1">Base price: R{product?.price}</p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.includes('✓') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current Pricing Tiers</h2>
        
        {rules.length > 0 ? (
          <div className="space-y-2 mb-6">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div className="flex-1">
                  <span className="font-mono text-sm">
                    {rule.minQuantity}g {rule.maxQuantity ? `- ${rule.maxQuantity}g` : '+'} → R{rule.tierPrice}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveRule(idx)}
                  className="text-red-600 hover:text-red-800 text-sm ml-4"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-6">No pricing tiers configured yet</p>
        )}

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Add New Tier</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Quantity (g)</label>
              <input
                type="number"
                min="1"
                value={newRule.minQuantity}
                onChange={(e) => setNewRule({...newRule, minQuantity: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g. 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Quantity (g, optional)</label>
              <input
                type="number"
                min="1"
                value={newRule.maxQuantity}
                onChange={(e) => setNewRule({...newRule, maxQuantity: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tier Price (R)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={newRule.tierPrice}
                onChange={(e) => setNewRule({...newRule, tierPrice: e.target.value})}
                className="w-full px-3 py-2 border rounded"
                placeholder="e.g. 100"
              />
            </div>
          </div>
          <button
            onClick={handleAddRule}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
