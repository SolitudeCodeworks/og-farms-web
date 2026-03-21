/**
 * GET /api/pudo/lockers
 * Returns cached PUDO lockers from DB. Falls back to live PUDO API if DB is empty.
 * Accepts optional ?sync=true query param to force a live sync (admin use).
 *
 * POST /api/pudo/lockers  (admin only – sync lockers from PUDO into DB)
 */
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllPudoLockers } from '@/lib/pudo'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const forceSync = searchParams.get('sync') === 'true'
    const search = searchParams.get('search') ?? ''

    if (forceSync) {
      const session = await getServerSession(authOptions)
      if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Try DB cache first — falls back to live PUDO API if table doesn't exist yet
    let lockers: any[] = []
    let dbAvailable = false

    try {
      const where: Record<string, unknown> = { isActive: true }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { town: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ]
      }
      lockers = await (prisma as any).pudoLocker.findMany({
        where,
        orderBy: [{ town: 'asc' }, { name: 'asc' }],
      })
      dbAvailable = true
    } catch {
      // PudoLocker table not yet migrated — fall through to live fetch
      dbAvailable = false
    }

    // If DB empty or not available, fetch live from PUDO
    if (lockers.length === 0) {
      const live = await getAllPudoLockers()
      const filtered = search
        ? live.filter(l =>
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            l.place?.town?.toLowerCase().includes(search.toLowerCase())
          )
        : live

      // Map to consistent shape
      lockers = filtered.map(l => ({
        id: l.code,
        code: l.code,
        name: l.name,
        address: l.address,
        latitude: l.latitude,
        longitude: l.longitude,
        town: l.place?.town ?? null,
        postalCode: l.place?.postalCode ?? null,
        isActive: true,
      }))

      // Persist to DB in background if table exists
      if (dbAvailable && !search) {
        syncLockers().catch(e => console.error('PUDO background sync error:', e))
      }
    }

    return NextResponse.json({ lockers })
  } catch (error: any) {
    console.error('PUDO lockers GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const count = await syncLockers()
    return NextResponse.json({ synced: count })
  } catch (error: any) {
    console.error('PUDO lockers sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function syncLockers(): Promise<number> {
  const lockers = await getAllPudoLockers()

  await Promise.all(
    lockers.map((locker) =>
      prisma.pudoLocker.upsert({
        where: { code: locker.code },
        update: {
          name: locker.name,
          address: locker.address,
          latitude: locker.latitude,
          longitude: locker.longitude,
          town: locker.place?.town ?? null,
          postalCode: locker.place?.postalCode ?? null,
          isActive: true,
          rawData: locker as any,
          updatedAt: new Date(),
        },
        create: {
          code: locker.code,
          name: locker.name,
          address: locker.address,
          latitude: locker.latitude,
          longitude: locker.longitude,
          town: locker.place?.town ?? null,
          postalCode: locker.place?.postalCode ?? null,
          isActive: true,
          rawData: locker as any,
        },
      })
    )
  )

  return lockers.length
}
