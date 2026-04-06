/**
 * GET /api/pudo/label?orderId=xxx
 * Admin-only: fetch (and cache) the PUDO waybill PDF URL for an order.
 */
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPudoLabel } from '@/lib/pudo'

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
      select: { pudoShipmentId: true, pudoLabelUrl: true },
    })

    if (!order?.pudoShipmentId) {
      return NextResponse.json({ error: 'No PUDO shipment for this order' }, { status: 404 })
    }

    // Return cached URL if exists (presigned URLs typically last 24h)
    if (order.pudoLabelUrl) {
      return NextResponse.json({ url: order.pudoLabelUrl })
    }

    const url = await getPudoLabel(order.pudoShipmentId)

    if (url) {
      await prisma.order.update({
        where: { id: orderId },
        data: { pudoLabelUrl: url },
      })
    }

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('PUDO label error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
