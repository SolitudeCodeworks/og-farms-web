'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Trash2, CircleHelp, X } from 'lucide-react'
import { getSubcategoryLabel } from '@/lib/product-constants'

type TierRule = {
  minQuantity: number
  maxQuantity: number | null
  tierPrice: number
}

type NewRuleForm = {
  minQuantity: string
  maxQuantity: string
  tierPrice: string
}

const EMPTY_FORM: NewRuleForm = {
  minQuantity: '',
  maxQuantity: '',
  tierPrice: '',
}

export default function SubcategoryBulkPricingPage() {
  const params = useParams()
  const subcategoryParam = (params.subcategory as string) || ''
  const decodedSubcategory = useMemo(() => decodeURIComponent(subcategoryParam), [subcategoryParam])
  const subcategoryLabel = useMemo(() => getSubcategoryLabel(decodedSubcategory), [decodedSubcategory])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [productsCount, setProductsCount] = useState(0)
  const [rules, setRules] = useState<TierRule[]>([])
  const [newRule, setNewRule] = useState<NewRuleForm>(EMPTY_FORM)
  const [message, setMessage] = useState('')
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  useEffect(() => {
    fetchCurrentRules()
  }, [decodedSubcategory])

  const fetchCurrentRules = async () => {
    try {
      setLoading(true)
      setMessage('')

      const response = await fetch(`/api/admin/bulk-pricing/subcategory?subcategory=${encodeURIComponent(decodedSubcategory)}`)
      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Failed to load subcategory bulk rules')
        return
      }

      setProductsCount(data.productsCount || 0)
      setRules((data.rules || []).map((rule: any) => ({
        minQuantity: Number(rule.minQuantity),
        maxQuantity: rule.maxQuantity === null ? null : Number(rule.maxQuantity),
        tierPrice: Number(rule.tierPrice),
      })))
    } catch (error) {
      console.error('Failed to fetch subcategory rules:', error)
      setMessage('Failed to load subcategory bulk rules')
    } finally {
      setLoading(false)
    }
  }

  const handleAddRule = () => {
    setMessage('')

    if (!newRule.minQuantity || !newRule.tierPrice) {
      setMessage('Min quantity and tier price are required')
      return
    }

    const minQuantity = Number(newRule.minQuantity)
    const maxQuantity = newRule.maxQuantity ? Number(newRule.maxQuantity) : null
    const tierPrice = Number(newRule.tierPrice)

    if (Number.isNaN(minQuantity) || minQuantity < 1) {
      setMessage('Min quantity must be at least 1')
      return
    }

    if (maxQuantity !== null && (Number.isNaN(maxQuantity) || maxQuantity < minQuantity)) {
      setMessage('Max quantity must be greater than or equal to min quantity')
      return
    }

    if (Number.isNaN(tierPrice) || tierPrice <= 0) {
      setMessage('Tier price must be greater than 0')
      return
    }

    if (rules.some((rule) => rule.minQuantity === minQuantity)) {
      setMessage('A tier with that min quantity already exists')
      return
    }

    const nextRules = [...rules, { minQuantity, maxQuantity, tierPrice }].sort((a, b) => a.minQuantity - b.minQuantity)
    setRules(nextRules)
    setNewRule(EMPTY_FORM)
  }

  const handleRemoveRule = (index: number) => {
    setMessage('')
    setRules(rules.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setMessage('')

    if (rules.length === 0) {
      setMessage('Add at least one tier before saving')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/admin/bulk-pricing/subcategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subcategory: decodedSubcategory,
          rules,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Failed to apply bulk deal to this subcategory')
        return
      }

      setMessage(`Applied to ${data.productsUpdated || 0} products successfully`)
      await fetchCurrentRules()
    } catch (error) {
      console.error('Failed to save subcategory rules:', error)
      setMessage('Failed to apply bulk deal to this subcategory')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6 text-white">
      <div className="flex items-center gap-4">
        <Link href="/admin/bulk-pricing" className="rounded-lg p-2 transition-colors hover:bg-zinc-800">
          <ArrowLeft className="h-5 w-5 text-white" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Category Wide Bulk Deal</h1>
          <p className="text-sm text-gray-400">
            {subcategoryLabel} ({decodedSubcategory}) · Applies to {productsCount} eligible products
          </p>
        </div>
        <button
          onClick={() => setShowHowItWorks(true)}
          className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
        >
          <CircleHelp className="h-4 w-4" />
          How this works
        </button>
      </div>

      {message && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-blue-300">
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">Current Tier Ladder</h2>

        {loading ? (
          <p className="text-gray-400">Loading rules...</p>
        ) : rules.length === 0 ? (
          <p className="text-gray-400">No category-wide tiers set yet.</p>
        ) : (
          <div className="mb-6 space-y-2">
            {rules.map((rule, index) => (
              <div
                key={`${rule.minQuantity}-${index}`}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3"
              >
                <span className="text-sm text-gray-200">
                  {rule.maxQuantity ? `${rule.minQuantity} - ${rule.maxQuantity}` : `${rule.minQuantity}+`} units {'->'} R{rule.tierPrice.toFixed(2)}
                </span>
                <button
                  onClick={() => handleRemoveRule(index)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-zinc-800 pt-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Add Tier</h3>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <label className="block text-sm text-gray-300">Min Quantity</label>
                <button
                  type="button"
                  title="Minimum quantity where this tier starts."
                  className="text-gray-400 hover:text-white"
                  aria-label="Min quantity help"
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
              </div>
              <input
                type="number"
                min="1"
                value={newRule.minQuantity}
                onChange={(e) => setNewRule((prev) => ({ ...prev, minQuantity: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white placeholder:text-gray-400 outline-none focus:border-primary"
                placeholder="e.g. 1"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <label className="block text-sm text-gray-300">Max Quantity (optional)</label>
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
                onChange={(e) => setNewRule((prev) => ({ ...prev, maxQuantity: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white placeholder:text-gray-400 outline-none focus:border-primary"
                placeholder="Leave empty for open-ended"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <label className="block text-sm text-gray-300">Tier Price (R)</label>
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
                onChange={(e) => setNewRule((prev) => ({ ...prev, tierPrice: e.target.value }))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white placeholder:text-gray-400 outline-none focus:border-primary"
                placeholder="e.g. 65"
              />
            </div>
          </div>

          <button
            onClick={handleAddRule}
            className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Add Tier
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || loading || productsCount === 0}
        className="w-full rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? 'Applying Deal...' : `Apply Deal To All ${productsCount} Products In ${subcategoryLabel}`}
      </button>

      {showHowItWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">How Category-Wide Deals Work</h3>
                <p className="text-sm text-gray-400">One tier ladder is copied to all products in this subcategory.</p>
              </div>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Close help modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="font-semibold text-white">What happens on Apply</p>
                <p>All eligible products in this subcategory receive this exact tier ladder.</p>
                <p>Old tier mins not in the new ladder are deactivated.</p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4">
                <p className="font-semibold text-white">Example</p>
                <p>1 unit - R65</p>
                <p>2 units - R120</p>
                <p>3+ units - R170</p>
                <p className="mt-2">If customer buys 3 units, the 3+ tier is applied.</p>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                <p className="font-semibold text-white">Good Setup Pattern</p>
                <p>Use sequential mins: 1, 2, 3, 5, 10.</p>
                <p>Leave max blank for the last open-ended tier.</p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowHowItWorks(false)}
                className="w-full rounded-full bg-primary px-4 py-3 font-bold text-white transition-colors hover:bg-primary/90"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
