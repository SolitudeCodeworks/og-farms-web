import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cache, cacheKeys } from "@/lib/cache"

// GET all products (admin only - no age restrictions)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // Generate cache key based on query params
    const cacheKey = cacheKeys.products({ page: page.toString(), limit: limit.toString(), search })

    // Check cache first
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    const skip = (page - 1) * limit

    // Build search filter
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    // Get total count for pagination
    const total = await prisma.product.count({ where })

    // Admin users see ALL products regardless of age restrictions
    // Sort by newest first (createdAt DESC)
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const totalPages = Math.ceil(total / limit)

    const result = {
      products,
      total,
      totalPages,
      currentPage: page,
    }

    // Cache the result for 24 hours
    cache.set(cacheKey, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()
    const {
      name,
      slug,
      description,
      price,
      category,
      subcategory,
      thcContent,
      cbdContent,
      strain,
      images,
      featured,
      ageRestricted,
      discountType,
      discountValue,
      discountStartDate,
      discountEndDate
    } = data

    // Check if slug already exists and add a number if needed
    let finalSlug = slug
    let existingProduct = await prisma.product.findUnique({
      where: { slug: finalSlug }
    })

    if (existingProduct) {
      let counter = 1
      let newSlug = `${slug}-${counter}`
      
      while (await prisma.product.findUnique({ where: { slug: newSlug } })) {
        counter++
        newSlug = `${slug}-${counter}`
      }
      
      finalSlug = newSlug
    }

    // Create product and inventory records in a transaction
    const product = await prisma.$transaction(async (tx) => {
      // Create the product
      const newProduct = await tx.product.create({
        data: {
          name,
          slug: finalSlug,
          description,
          price,
          category,
          subcategory: subcategory && subcategory.trim() !== "" ? subcategory : null,
          thcContent: thcContent && thcContent.trim() !== "" ? thcContent : null,
          cbdContent: cbdContent && cbdContent.trim() !== "" ? cbdContent : null,
          strain: strain && strain.trim() !== "" ? strain : null,
          images,
          featured: featured || false,
          ageRestricted: ageRestricted !== undefined ? ageRestricted : true,
          discountType: discountType && discountType.trim() !== "" ? discountType : null,
          discountValue: discountValue && discountValue > 0 ? discountValue : null,
          discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
          discountEndDate: discountEndDate ? new Date(discountEndDate) : null
        }
      })

      // Get all active stores
      const stores = await tx.store.findMany({
        where: { isActive: true },
        select: { id: true }
      })

      // Create inventory records for all stores with quantity 0
      if (stores.length > 0) {
        await tx.storeInventory.createMany({
          data: stores.map(store => ({
            storeId: store.id,
            productId: newProduct.id,
            quantity: 0,
            lowStockAlert: 10
          }))
        })
      }

      return newProduct
    })

    // Invalidate all product cache entries
    cache.invalidatePattern('^products:')
    cache.invalidatePattern('^inventory:')

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating product:", error)
    
    // Handle unique constraint violation (slug conflict)
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return NextResponse.json(
        { error: "A product with this URL slug already exists. Please use a different name or manually edit the slug." },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to create product. Please try again." },
      { status: 500 }
    )
  }
}
