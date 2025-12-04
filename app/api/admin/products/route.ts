import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all products (admin only - no age restrictions)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Admin users see ALL products regardless of age restrictions
    const products = await prisma.product.findMany({
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ products })
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

    const product = await prisma.product.create({
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
