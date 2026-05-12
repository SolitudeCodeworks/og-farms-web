/**
 * Pricing Engine for Bulk Buy Tiers
 * 
 * Server-side source of truth for calculating effective prices with bulk discounts.
 * Applied in cart, checkout, and order creation to ensure payment accuracy.
 */

import { prisma } from "./prisma"

/**
 * Range classification mapping based on product subcategory
 * Maps DB subcategory values to display ranges for pricing tiers
 */
export const RANGE_MAPPING: Record<string, string> = {
  "outdoor": "landrace",
  "greenhouse": "greens",
  "indoor": "indoor",
  "Indoor": "indoor", // Handle case mismatch during transition
  "promo_indoor": "connoisseur",
  "medical": "medical",
}

/**
 * Define range display labels for UI
 */
export const RANGE_LABELS: Record<string, string> = {
  "landrace": "Landrace",
  "greens": "Greens",
  "indoor": "Indoor",
  "connoisseur": "Connoisseur",
  "medical": "Medical",
}

/**
 * Get the range key for a product based on category + subcategory
 */
export function getProductRange(category: string, subcategory: string | null): string | null {
  if (!subcategory) return null
  return RANGE_MAPPING[subcategory.toLowerCase()] || null
}

export interface BulkTierMatch {
  minQuantity: number
  maxQuantity: number | null
  tierPrice: number
  appliedFrom: "product-override" | "range-default"
}

export interface PricingBreakdown {
  basePrice: number
  quantity: number
  bulkTier: BulkTierMatch | null
  subtotal: number
  bulkDiscount: number
  effectivePrice: number
}

/**
 * Calculate effective price for a single product line given quantity
 * 
 * Precedence: product override > range default > base price (no tier)
 */
export async function calculateLinePrice(
  productId: string,
  category: string,
  subcategory: string | null,
  basePrice: number,
  quantity: number
): Promise<PricingBreakdown> {
  // Resolve range
  const range = getProductRange(category, subcategory)

  // Check for product-level override first (takes precedence)
  let tierRule = null
  
  if (category === "FLOWER" || category === "PRE_ROLLS") {
    tierRule = await prisma.bulkPricingRule.findFirst({
      where: {
        productId,
        isActive: true,
        rangeKey: null, // Product override has no rangeKey
        minQuantity: { lte: quantity },
        OR: [
          { maxQuantity: null }, // Unlimited
          { maxQuantity: { gte: quantity } } // Within range
        ]
      },
      orderBy: { minQuantity: "desc" }, // Get highest matching tier
    })
  }

  // Fall back to range default if no product override
  let appliedFrom: "product-override" | "range-default" = "product-override"
  if (!tierRule && range) {
    tierRule = await prisma.bulkPricingRule.findFirst({
      where: {
        rangeKey: range,
        isActive: true,
        minQuantity: { lte: quantity },
        OR: [
          { maxQuantity: null },
          { maxQuantity: { gte: quantity } }
        ]
      },
      orderBy: { minQuantity: "desc" },
    })
    appliedFrom = "range-default"
  }

  // Calculate totals
  let effectivePrice = basePrice * quantity
  let bulkDiscount = 0

  if (tierRule) {
    effectivePrice = tierRule.tierPrice
    bulkDiscount = basePrice * quantity - tierRule.tierPrice
  }

  return {
    basePrice,
    quantity,
    bulkTier: tierRule
      ? {
          minQuantity: tierRule.minQuantity,
          maxQuantity: tierRule.maxQuantity,
          tierPrice: tierRule.tierPrice,
          appliedFrom,
        }
      : null,
    subtotal: basePrice * quantity,
    bulkDiscount,
    effectivePrice,
  }
}

/**
 * Calculate total pricing for an entire order
 * Returns server-authoritative breakdown
 */
export async function calculateOrderTotals(
  items: Array<{
    productId: string
    quantity: number
    product: {
      category: string
      subcategory: string | null
      price: number
    }
  }>
) {
  const lineBreakdowns: PricingBreakdown[] = []
  let totalBulkDiscount = 0
  let totalBaseSubtotal = 0
  let totalAfterBulk = 0

  for (const item of items) {
    const breakdown = await calculateLinePrice(
      item.productId,
      item.product.category,
      item.product.subcategory,
      item.product.price,
      item.quantity
    )
    lineBreakdowns.push(breakdown)
    totalBaseSubtotal += breakdown.subtotal
    totalBulkDiscount += breakdown.bulkDiscount
    totalAfterBulk += breakdown.effectivePrice
  }

  return {
    lineBreakdowns,
    baseSubtotal: totalBaseSubtotal,
    bulkDiscountAmount: totalBulkDiscount,
    subtotal: totalAfterBulk, // Subtotal after bulk discount, before shipping/tax
  }
}

/**
 * Validate tier rules for overlap before saving
 * Ensures no two tiers with same minQuantity or overlapping ranges
 */
export function validateTierRules(
  rules: Array<{
    minQuantity: number
    maxQuantity: number | null
  }>
): { valid: boolean; error?: string } {
  // Sort by minQuantity
  const sorted = [...rules].sort((a, b) => a.minQuantity - b.minQuantity)

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i]
    const next = sorted[i + 1]

    // Check for duplicate minQuantity
    if (current.minQuantity === next.minQuantity) {
      return { valid: false, error: "Duplicate minimum quantities not allowed" }
    }

    // Check for overlap: current.max >= next.min
    if (current.maxQuantity !== null && current.maxQuantity >= next.minQuantity) {
      return {
        valid: false,
        error: `Tier ranges overlap: ${current.minQuantity}-${current.maxQuantity} conflicts with ${next.minQuantity}`,
      }
    }
  }

  return { valid: true }
}
