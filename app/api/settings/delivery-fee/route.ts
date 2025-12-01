import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: 'delivery_fee' }
    })

    const deliveryFee = setting ? parseFloat(setting.value) : 0

    return NextResponse.json({ deliveryFee })
  } catch (error) {
    console.error('Error fetching delivery fee:', error)
    return NextResponse.json({ deliveryFee: 0 })
  }
}

export async function POST(request: Request) {
  try {
    const { deliveryFee } = await request.json()

    await prisma.siteSettings.upsert({
      where: { key: 'delivery_fee' },
      update: { 
        value: deliveryFee.toString(),
        description: 'Delivery fee charged for orders'
      },
      create: {
        key: 'delivery_fee',
        value: deliveryFee.toString(),
        category: 'pricing',
        description: 'Delivery fee charged for orders'
      }
    })

    return NextResponse.json({ success: true, deliveryFee })
  } catch (error) {
    console.error('Error updating delivery fee:', error)
    return NextResponse.json({ error: 'Failed to update delivery fee' }, { status: 500 })
  }
}
