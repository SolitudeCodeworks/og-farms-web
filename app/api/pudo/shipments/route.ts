/**
 * POST /api/pudo/shipments
 * Admin-only: manually book a PUDO shipment for an existing order.
 *
 * Body: { orderId: string, serviceLevelCode?: string }
 *
 * GET /api/pudo/shipments?orderId=xxx
 * Get PUDO tracking info for an order.
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createPudoD2LShipment,
  trackPudoShipment,
  getPudoLabel,
  cancelPudoShipment,
  type PudoAddress,
  type PudoContact,
  type PudoParcel,
} from '@/lib/pudo'

// Store collection address – configure via env or SiteSettings
function getStoreCollectionAddress(): PudoAddress {
  return {
    street_address: process.env.STORE_STREET ?? 'Shop 3 Palm Buildings Bashee Street',
    local_area: process.env.STORE_SUBURB ?? 'Johannesburg',
    city: process.env.STORE_CITY ?? 'Johannesburg',
    zone: process.env.STORE_ZONE ?? 'GP',
    country: 'South Africa',
    entered_address: process.env.STORE_ENTERED_ADDRESS ?? 'Shop 3 Palm Buildings Bashee Street, Johannesburg, GP, South Africa',
    type: 'commercial',
    lat: process.env.STORE_LAT,
    lng: process.env.STORE_LNG,
    company: 'OG Farms',
  }
}

function getStoreContact(): PudoContact {
  return {
    name: process.env.STORE_CONTACT_NAME ?? 'OG Farms',
    email: process.env.STORE_CONTACT_EMAIL ?? 'info@ogfarms.co.za',
    mobile_number: process.env.STORE_CONTACT_PHONE ?? '+27739638575',
  }
}

function defaultParcel(): PudoParcel {
  return {
    submitted_length_cm: '30',
    submitted_width_cm: '20',
    submitted_height_cm: '10',
    submitted_weight_kg: '1',
    parcel_description: 'OG Farms Order',
    alternative_tracking_reference: '',
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, serviceLevelCode } = body

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.pudoShipmentId) {
      return NextResponse.json(
        { error: 'PUDO shipment already booked for this order', pudoShipmentId: order.pudoShipmentId },
        { status: 409 }
      )
    }

    const collectionAddress = getStoreCollectionAddress()
    const collectionContact = getStoreContact()
    const deliveryContact: PudoContact = {
      name: order.customerName,
      email: order.customerEmail,
      mobile_number: order.customerPhone.startsWith('+')
        ? order.customerPhone
        : `+27${order.customerPhone.replace(/^0/, '')}`,
    }

    let shipment

    if (order.fulfillmentType === 'PUDO' && order.pudoLockerCode) {
      // Door-to-Locker
      shipment = await createPudoD2LShipment({
        collectionAddress,
        collectionContact,
        lockerTerminalId: order.pudoLockerCode,
        deliveryContact,
        serviceLevelCode: serviceLevelCode ?? order.pudoServiceLevelCode ?? 'D2LXS - ECO',
      })
    } else {
      return NextResponse.json(
        { error: 'Cannot book PUDO shipment for pickup orders' },
        { status: 400 }
      )
    }

    // Persist PUDO details on the order
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        pudoShipmentId: String(shipment.id),
        pudoTrackingReference: shipment.custom_tracking_reference,
        pudoStatus: shipment.status,
        pudoRate: shipment.rate,
        pudoServiceLevelCode: serviceLevelCode ?? order.pudoServiceLevelCode ?? null,
      },
    })

    return NextResponse.json({
      success: true,
      shipment,
      order: { id: updated.id, pudoShipmentId: updated.pudoShipmentId, pudoTrackingReference: updated.pudoTrackingReference },
    })
  } catch (error: any) {
    console.error('PUDO create shipment error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { pudoShipmentId: true, pudoTrackingReference: true, pudoStatus: true },
    })

    if (!order?.pudoShipmentId) {
      return NextResponse.json({ error: 'No PUDO shipment for this order' }, { status: 404 })
    }

    const tracking = await trackPudoShipment(order.pudoShipmentId)
    return NextResponse.json({ tracking, order })
  } catch (error: any) {
    console.error('PUDO tracking error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { pudoShipmentId: true },
    })

    if (!order?.pudoShipmentId) {
      return NextResponse.json({ error: 'No PUDO shipment to cancel' }, { status: 404 })
    }

    await cancelPudoShipment(order.pudoShipmentId)

    await prisma.order.update({
      where: { id: orderId },
      data: { pudoStatus: 'cancelled' },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('PUDO cancel error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ── Helper ────────────────────────────────────────────────────────────────────

function provinceToZone(province: string): string {
  const map: Record<string, string> = {
    'Gauteng': 'GP',
    'Western Cape': 'WC',
    'KwaZulu-Natal': 'KZN',
    'Eastern Cape': 'EC',
    'Northern Cape': 'NC',
    'North West': 'NW',
    'Limpopo': 'LP',
    'Mpumalanga': 'MP',
    'Free State': 'FS',
  }
  return map[province] ?? 'GP'
}
