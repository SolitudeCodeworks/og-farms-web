/**
 * POST /api/pudo/rates
 * Get PUDO shipping rates for a D2L (door-to-locker) shipment.
 *
 * Body:
 * {
 *   lockerCode: string        // terminal_id e.g. "CG54"
 *   collectionAddress: {      // your store / warehouse address
 *     street_address, local_area, city, zone, country, entered_address,
 *     lat, lng, type
 *   }
 * }
 */
import { NextResponse } from 'next/server'
import { getPudoD2LRates } from '@/lib/pudo'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { lockerCode, collectionAddress, parcel } = body

    if (!lockerCode || !collectionAddress) {
      return NextResponse.json(
        { error: 'lockerCode and collectionAddress are required' },
        { status: 400 }
      )
    }

    // Read collection method from admin settings (default D2L)
    const methodSetting = await prisma.siteSettings.findUnique({ where: { key: 'pudo_collection_method' } })
    const collectionMethod = methodSetting?.value ?? 'D2L' // 'D2L' | 'K2L'

    const rates = await getPudoD2LRates(collectionAddress, lockerCode, parcel)
    const allRates: any[] = rates.rates ?? []

    let chosen: any = null

    if (collectionMethod === 'K2L') {
      // Kiosk to Locker — size based on parcel dims
      const l = parseFloat(parcel?.submitted_length_cm ?? '0')
      const w = parseFloat(parcel?.submitted_width_cm ?? '0')
      const h = parseFloat(parcel?.submitted_height_cm ?? '0')

      let minSize: 'S' | 'M' | 'L' | 'XL' = 'S'
      if (l > 32 || w > 32 || h > 38) minSize = 'XL'
      else if (l > 32 || w > 19 || h > 19) minSize = 'L'
      else if (l > 19 || w > 13 || h > 13) minSize = 'M'

      const sizeOrder = ['S', 'M', 'L', 'XL'] as const
      const preference = sizeOrder.slice(sizeOrder.indexOf(minSize)).map(s => `K2L${s} - ECO`)
      const k2lRates = allRates.filter((r: any) => r.service_level?.code?.startsWith('K2L'))

      for (const code of preference) {
        chosen = k2lRates.find((r: any) => r.service_level?.code === code)
        if (chosen) break
      }
      if (!chosen) chosen = k2lRates[0] ?? null
    } else {
      // Door to Locker — ECO or OVN
      chosen = allRates.find((r: any) => r.service_level?.code === 'ECO')
        ?? allRates.find((r: any) => r.service_level?.code === 'OVN')
        ?? allRates[0]
    }

    return NextResponse.json({
      rate: chosen ? parseFloat(chosen.rate) : null,
      serviceLevelCode: chosen?.service_level?.code ?? (collectionMethod === 'K2L' ? 'K2LS - ECO' : 'ECO'),
      serviceLevelName: chosen?.service_level?.name ?? null,
      collectionMethod,
      allRates,
    })
  } catch (error: any) {
    console.error('PUDO rates error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
