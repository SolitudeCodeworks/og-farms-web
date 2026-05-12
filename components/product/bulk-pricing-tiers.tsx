/**
 * Bulk Pricing Tiers Display Component
 * 
 * Shows all applicable quantity tiers and savings for a product
 */

'use client'

import { useEffect, useState } from 'react'

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
      const res = await fetch(`/api/admin/products/${productId}/bulk-pricing`)
      if (res.ok) {
        const data = await res.json()
        setTiers(data.rules.filter((r: any) => r.rangeKey === null)) // Only product overrides visible
      }
    } catch (error) {
      console.error('Failed to fetch pricing tiers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Don't show for non-tier categories or if no tiers exist
  if (loading || !tiers.length) return null

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-sm mb-3 text-blue-900">💰 Bulk Discounts Available</h3>
      
      <div className="space-y-2">
        {tiers.map((tier, idx) => {
          const qtyRange = tier.maxQuantity 
            ? `${tier.minQuantity}-${tier.maxQuantity}g` 
            : `${tier.minQuantity}g+`
          const baseCost = basePrice * tier.minQuantity
          const discount = baseCost - tier.tierPrice
          const discountPercent = ((discount / baseCost) * 100).toFixed(0)

          return (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-gray-700">
                {qtyRange}: <span className="font-mono">R{tier.tierPrice}</span>
              </span>
              {discount > 0 && (
                <span className="text-green-600 font-medium">
                  Save R{discount.toFixed(2)} ({discountPercent}%)
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
