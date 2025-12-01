import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Reuse age verification cache from products API
const ageVerificationCache = new Map<string, { isOver18: boolean, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function checkUserAge(email: string): Promise<boolean> {
  const cached = ageVerificationCache.get(email)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.isOver18
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { dateOfBirth: true }
  })
  
  let isOver18 = false
  if (user?.dateOfBirth) {
    const birthDate = new Date(user.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    isOver18 = age >= 18
  }

  ageVerificationCache.set(email, { isOver18, timestamp: Date.now() })
  return isOver18
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    // Return empty array if no query
    if (!query || query.trim().length === 0) {
      return NextResponse.json([])
    }

    const session = await getServerSession(authOptions)
    
    // Check if user is logged in and 18+
    let isOver18 = false
    if (session?.user?.email) {
      isOver18 = await checkUserAge(session.user.email)
    }

    // Search products in database
    const products = await prisma.product.findMany({
      where: {
        AND: [
          // Age restriction filter - if not logged in or under 18, hide age-restricted products
          isOver18 ? {} : { ageRestricted: false },
          // Search query
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                description: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                strain: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                subcategory: {
                  contains: query,
                  mode: 'insensitive'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        category: true
      },
      take: 50, // Limit results to 50
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
