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
  { value: "cbd", label: "CBD" },
  { value: "n/a", label: "N/A" },
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
