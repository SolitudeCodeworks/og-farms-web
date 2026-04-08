/**
 * PUDO (TCG Locker) API client
 * Sandbox: https://sandbox.api-pudo.co.za/api/v1
 * Production: https://api-pudo.co.za/api/v1
 *
 * Auth: Bearer token in Authorization header
 * Set PUDO_API_TOKEN=your_token in .env
 * Set PUDO_BASE_URL=https://api-pudo.co.za/api/v1 for prod (defaults to sandbox)
 */

function baseUrl() {
  return process.env.PUDO_BASE_URL ?? 'https://sandbox.api-pudo.co.za/api/v1'
}

function bearerToken() {
  const token = process.env.PUDO_API_TOKEN ?? process.env.PUDO_API_KEY
  if (!token) throw new Error('PUDO_API_TOKEN env var is not set')
  return token
}

async function pudoFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${baseUrl()}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${bearerToken()}`,
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PUDO API ${res.status}: ${text}`)
  }

  return res.json() as Promise<T>
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PudoAddress {
  lat?: string | number
  lng?: string | number
  street_address?: string
  local_area?: string
  suburb?: string
  city?: string
  code?: string
  zone?: string
  country?: string
  entered_address?: string
  type?: 'residential' | 'commercial'
  company?: string
  terminal_id?: string
}

export interface PudoContact {
  name: string
  email: string
  mobile_number: string
}

export interface PudoParcel {
  submitted_length_cm: string
  submitted_width_cm: string
  submitted_height_cm: string
  submitted_weight_kg: string
  parcel_description: string
  alternative_tracking_reference?: string
}

export interface PudoRate {
  rate: string
  rate_excluding_vat: number
  charged_weight?: number
  service_level: {
    id: number
    code: string
    name: string
    description?: string
    box_type_name?: string
    box_type?: string
    dimensions?: { width: number; height: number; length: number; weight: number }
    collection_date?: string
    delivery_date_from?: string
    delivery_date_to?: string
  }
  base_rate?: {
    charge: number
    rate_formula_type: string
    vat: number
  }
}

export interface PudoShipment {
  id: number
  custom_tracking_reference: string
  pincode?: string
  status: string
  account_id?: number
  rate: number
  service_level_name?: string
  service_level_code?: string
  locker_provider?: string
  collection_min_date?: string
  delivery_min_date?: string
  estimated_delivery_from?: string
  estimated_delivery_to?: string
}

export interface PudoLocker {
  code: string
  name: string
  latitude: string
  longitude: string
  address: string
  type: { id: number; name: string }
  place: { town: string; postalCode: string }
  openinghours?: { day: string; open_time: string; close_time: string }[]
}

// ─── Lockers (no auth needed) ─────────────────────────────────────────────────

export async function getAllPudoLockers(): Promise<PudoLocker[]> {
  const url = `${baseUrl()}/lockers-data`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${bearerToken()}`,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`PUDO lockers ${res.status}: ${text}`)
  }
  return res.json()
}

// ─── Parcel sizing ────────────────────────────────────────────────────────────

/**
 * Category-based parcel dimensions per unit.
 * Cannabis products are very small/light — flower buds weigh grams,
 * pre-rolls are thin tubes, accessories/grinders are the heaviest.
 */
// Per-unit dims. l/w = footprint (takes max across items), h = stackable height (accumulates).
const CATEGORY_PARCEL: Record<string, { l: number; w: number; h: number; kg: number }> = {
  FLOWER:          { l: 10, w: 8,  h: 5,  kg: 0.05  }, // small sealed pouch
  PRE_ROLLS:       { l: 12, w: 4,  h: 4,  kg: 0.03  }, // thin tube box
  EDIBLES:         { l: 12, w: 10, h: 5,  kg: 0.15  }, // gummy packet / tin
  CONCENTRATES:    { l: 8,  w: 6,  h: 4,  kg: 0.1   }, // small glass jar
  VAPES:           { l: 12, w: 5,  h: 3,  kg: 0.08  }, // pen + box
  ACCESSORIES:     { l: 27, w: 18, h: 2,  kg: 0.25  }, // rolling tray sized (worst case)
  ROLLING_PAPERS:  { l: 10, w: 5,  h: 2,  kg: 0.02  }, // flat booklet
  BONGS_AND_PIPES: { l: 30, w: 20, h: 15, kg: 0.6   }, // largest category
  GRINDERS:        { l: 10, w: 10, h: 6,  kg: 0.25  }, // metal disc
  OTHER:           { l: 12, w: 10, h: 6,  kg: 0.15  },
}

const DEFAULT_PARCEL = { l: 15, w: 12, h: 8, kg: 0.2 }

export interface CartItemForParcel {
  category?: string // Category enum value e.g. "FLOWER"
  quantity: number
}

/**
 * Builds a single combined PUDO parcel from all cart items.
 * Footprint (l/w) = max across all item types.
 * Height stacks — each unit adds its h, so 17 trays = 34cm tall.
 * Weight sums across all quantities.
 */
export function buildParcelFromCart(items: CartItemForParcel[]): PudoParcel {
  let maxL = 0, maxW = 0, totalH = 0, totalKg = 0

  for (const item of items) {
    const dims = (item.category ? CATEGORY_PARCEL[item.category] : undefined) ?? DEFAULT_PARCEL
    if (dims.l > maxL) maxL = dims.l
    if (dims.w > maxW) maxW = dims.w
    totalH += dims.h * item.quantity
    totalKg += dims.kg * item.quantity
  }

  // PUDO minimum 0.5kg; cap at 30kg (PUDO locker limit)
  const billedKg = Math.min(Math.max(totalKg, 0.5), 30)

  return {
    submitted_length_cm: String(Math.max(maxL, 10)),
    submitted_width_cm:  String(Math.max(maxW, 8)),
    submitted_height_cm: String(Math.max(totalH, 4)),
    submitted_weight_kg: billedKg.toFixed(2),
    parcel_description: 'OG Farms Order',
  }
}

// ─── Rates ────────────────────────────────────────────────────────────────────

export async function getPudoD2LRates(
  collectionAddress: PudoAddress,
  lockerTerminalId: string,
  parcel?: Partial<PudoParcel>
): Promise<{ rates: PudoRate[] }> {
  const defaultParcel: PudoParcel = {
    submitted_length_cm: '20',
    submitted_width_cm: '15',
    submitted_height_cm: '10',
    submitted_weight_kg: '1',
    parcel_description: 'Order',
    ...parcel,
  }
  return pudoFetch('/rates', {
    method: 'POST',
    body: JSON.stringify({
      collection_address: collectionAddress,
      delivery_address: { terminal_id: lockerTerminalId },
      parcels: [defaultParcel],
      opt_in_rates: [],
      opt_in_time_based_rates: [],
    }),
  })
}

// ─── Shipments ────────────────────────────────────────────────────────────────

export async function createPudoD2LShipment(opts: {
  collectionAddress: PudoAddress
  collectionContact: PudoContact
  lockerTerminalId: string
  deliveryContact: PudoContact
  serviceLevelCode: string
  collectionMinDate?: string
  deliveryMinDate?: string
  parcel?: PudoParcel
}): Promise<PudoShipment> {
  const now = new Date().toISOString()
  const parcel = opts.parcel ?? {
    submitted_length_cm: '20',
    submitted_width_cm: '15',
    submitted_height_cm: '10',
    submitted_weight_kg: '0.50',
    parcel_description: 'OG Farms Order',
  }
  return pudoFetch('/shipments', {
    method: 'POST',
    body: JSON.stringify({
      collection_address: opts.collectionAddress,
      collection_contact: opts.collectionContact,
      delivery_address: { terminal_id: opts.lockerTerminalId },
      delivery_contact: opts.deliveryContact,
      service_level_code: opts.serviceLevelCode,
      parcels: [parcel],
      opt_in_rates: [],
      opt_in_time_based_rates: [],
      collection_min_date: opts.collectionMinDate ?? now,
      delivery_min_date: opts.deliveryMinDate ?? now,
      collection_after: '08:00',
      collection_before: '17:00',
    }),
  })
}

export async function cancelPudoShipment(shipmentId: number | string): Promise<unknown> {
  return pudoFetch(`/shipments/${shipmentId}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'cancelled' }),
  })
}

export async function trackPudoShipment(shipmentId: number | string): Promise<unknown> {
  return pudoFetch(`/tracking/shipments?id=${shipmentId}&include_parcels=false`)
}

export async function getPudoLabel(shipmentId: number | string): Promise<string> {
  // Label endpoint uses api_key query param (different auth)
  const token = process.env.PUDO_API_TOKEN ?? ''
  const url = `${baseUrl().replace('/api/v1', '')}/generate/waybill/${shipmentId}?api_key=${encodeURIComponent(token)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return ''
  const data = await res.json()
  return typeof data === 'string' ? data : (data?.url ?? data?.pdf_url ?? '')
}
