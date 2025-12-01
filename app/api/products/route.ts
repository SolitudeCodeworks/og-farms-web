import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Cache age verification for 5 minutes
const ageVerificationCache = new Map<string, { isOver18: boolean, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function checkUserAge(email: string): Promise<boolean> {
  // Check cache first
  const cached = ageVerificationCache.get(email)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.isOver18
  }

  // Query database
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

  // Cache result
  ageVerificationCache.set(email, { isOver18, timestamp: Date.now() })
  
  return isOver18
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Admin users bypass age restrictions
    const isAdmin = session?.user?.role === 'ADMIN'
    
    // Check if user is logged in and 18+
    let isOver18 = isAdmin
    if (!isAdmin && session?.user?.email) {
      isOver18 = await checkUserAge(session.user.email)
    }

    // Optimized query - only select needed fields
    const products = await prisma.product.findMany({
      where: isOver18 ? {} : {
        ageRestricted: false
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        category: true,
        subcategory: true,
        images: true,
        featured: true,
        ageRestricted: true,
        thcContent: true,
        cbdContent: true,
        strain: true,
        discountType: true,
        discountValue: true,
        discountStartDate: true,
        discountEndDate: true,
        averageRating: true,
        totalReviews: true,
        createdAt: true
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ products }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
