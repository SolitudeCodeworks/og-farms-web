// Single source of truth for product categories and filters

export const PRODUCT_CATEGORIES = [
  { value: "FLOWER", label: "Flower" },
  { value: "PRE_ROLLS", label: "Pre-Rolls" },
  { value: "EDIBLES", label: "Edibles" },
  { value: "CONCENTRATES", label: "Concentrates" },
  { value: "VAPES", label: "Vapes" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "ROLLING_PAPERS", label: "Rolling Papers" },
  { value: "BONGS_AND_PIPES", label: "Bongs & Pipes" },
  { value: "GRINDERS", label: "Grinders" },
  { value: "OTHER", label: "Other" },
] as const

export const STRAIN_TYPES = [
  { value: "indica", label: "Indica" },
  { value: "sativa", label: "Sativa" },
  { value: "hybrid", label: "Hybrid" },
  { value: "n/a", label: "N/A" },
] as const

export const SUBCATEGORIES = [
  { value: "no", label: "Not Specified" },
  { value: "medical", label: "Medical Grade Indoor" },
  { value: "promo_indoor", label: "Connoisseur (Premium) Indoor" },
  { value: "indoor", label: "Indoor" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "outdoor", label: "Outdoor" },
] as const

/**
 * Range-based pricing tiers (for Flower and Pre-Rolls)
 * Maps subcategory to range display name and pricing metadata
 */
export const PRICING_RANGES = [
  { 
    key: "landrace",
    label: "Landrace",
    description: "Outdoor grown, budget-friendly options",
    subcategories: ["outdoor"],
    order: 1
  },
  { 
    key: "greens",
    label: "Greens",
    description: "Greenhouse grown, balanced quality and value",
    subcategories: ["greenhouse"],
    order: 2
  },
  { 
    key: "indoor",
    label: "Indoor",
    description: "Indoor grown, premium quality and potency",
    subcategories: ["indoor"],
    order: 3
  },
  { 
    key: "connoisseur",
    label: "Connoisseur",
    description: "Premium indoor, top-shelf selection",
    subcategories: ["promo_indoor"],
    order: 4
  },
  { 
    key: "medical",
    label: "Medical",
    description: "Medical-grade, therapeutic focus",
    subcategories: ["medical"],
    order: 5
  },
] as const

export const PRICE_RANGES = [
  { value: "0-100", label: "Under R100", min: 0, max: 100 },
  { value: "100-200", label: "R100 - R200", min: 100, max: 200 },
  { value: "200-500", label: "R200 - R500", min: 200, max: 500 },
  { value: "500-1000", label: "R500 - R1000", min: 500, max: 1000 },
  { value: "1000+", label: "Over R1000", min: 1000, max: Infinity },
] as const

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
] as const

// Helper to get category label from value
export function getCategoryLabel(value: string): string {
  return PRODUCT_CATEGORIES.find(cat => cat.value === value)?.label || value
}

// Helper to get strain label from value
export function getStrainLabel(value: string): string {
  return STRAIN_TYPES.find(strain => strain.value === value)?.label || value
}

// Helper to get subcategory label from value
export function getSubcategoryLabel(value: string): string {
  return SUBCATEGORIES.find(sub => sub.value === value)?.label || value
}

// Helper to get range label from subcategory
export function getRangeLabel(subcategory: string | null): string {
  if (!subcategory) return "Standard"
  const normalized = subcategory.toLowerCase()
  const range = PRICING_RANGES.find(r => (r.subcategories as readonly string[]).includes(normalized))
  return range?.label || "Standard"
}

// Helper to get range key from subcategory
export function getRangeKey(subcategory: string | null): string | null {
  if (!subcategory) return null
  const normalized = subcategory.toLowerCase()
  const range = PRICING_RANGES.find(r => (r.subcategories as readonly string[]).includes(normalized))
  return range?.key || null
}
