/**
 * Bulk Pricing Tiers Display Component
 * 
 * Shows all applicable quantity tiers and savings for a product
 */

'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, BadgePercent } from 'lucide-react'

interface BulkTier {
  minQuantity: number
  maxQuantity: number | null
  tierPrice: number
}

interface BulkPricingTiersProps {
  productId: string
  basePrice: number
  category: string
}

export default function BulkPricingTiers({ 
  productId, 
  basePrice, 
  category 
}: BulkPricingTiersProps) {
  const [tiers, setTiers] = useState<BulkTier[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    // Only show bulk pricing for Flower and Pre-Rolls
    if (category !== 'FLOWER' && category !== 'PRE_ROLLS') {
      setLoading(false)
      return
    }

    fetchTiers()
  }, [productId, category])

  const fetchTiers = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/bulk-pricing`)
      if (res.ok) {
        const data = await res.json()
        setTiers((data.rules || []).filter((r: any) => r.rangeKey === null))
      }
    } catch (error) {
      console.error('Failed to fetch pricing tiers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show for non-tier categories or if no tiers exist
  if (loading || !tiers.length) return null

  const summarized = tiers.slice(0, 3)
  const hiddenCount = Math.max(0, tiers.length - summarized.length)

  const bestTier = [...tiers]
    .map((tier) => {
      const sampleQty = tier.maxQuantity ? Math.max(tier.minQuantity, Math.min(tier.maxQuantity, tier.minQuantity)) : tier.minQuantity
      const baseTotal = basePrice * sampleQty
      const savings = Math.max(0, baseTotal - tier.tierPrice)
      return {
        tier,
        savings,
      }
    })
    .sort((a, b) => b.savings - a.savings)[0]

  const formatTierRange = (tier: BulkTier) => {
    if (tier.maxQuantity) {
      return `${tier.minQuantity}-${tier.maxQuantity} units`
    }
    return `${tier.minQuantity}+ units`
  }

  return (
    <div className="mt-6 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-zinc-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-emerald-300">Bulk deal available</p>
          {bestTier ? (
            <p className="mt-1 text-sm text-gray-200">
              Best visible tier: {formatTierRange(bestTier.tier)} at <span className="font-semibold text-white">R{bestTier.tier.tierPrice.toFixed(2)}</span>
            </p>
          ) : null}
        </div>
        <BadgePercent className="h-5 w-5 text-emerald-300" />
      </div>

      <div className="mt-3 space-y-2">
        {summarized.map((tier, idx) => {
          const baseCost = basePrice * tier.minQuantity
          const discount = Math.max(0, baseCost - tier.tierPrice)

          return (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{formatTierRange(tier)}</span>
              <span className="font-semibold text-white">R{tier.tierPrice.toFixed(2)}</span>
              {discount > 0 ? (
                <span className="text-emerald-300">Save R{discount.toFixed(2)}</span>
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {hiddenCount > 0 ? (
          <p className="text-xs text-gray-400">+ {hiddenCount} more tiers</p>
        ) : (
          <p className="text-xs text-gray-500">Tier pricing updates automatically in cart and checkout.</p>
        )}
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
        >
          {expanded ? 'Hide full ladder' : 'View full ladder'}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-950/70 p-3">
          {tiers.map((tier, idx) => {
            const baseCost = basePrice * tier.minQuantity
            const discount = Math.max(0, baseCost - tier.tierPrice)

            return (
              <div key={`${tier.minQuantity}-${idx}`} className="flex items-center justify-between text-xs">
                <span className="text-gray-300">{formatTierRange(tier)}</span>
                <span className="font-semibold text-white">R{tier.tierPrice.toFixed(2)}</span>
                <span className="text-emerald-300">{discount > 0 ? `Save R${discount.toFixed(2)}` : '-'}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
