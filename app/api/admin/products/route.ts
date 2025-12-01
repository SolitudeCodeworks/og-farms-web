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

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        category,
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
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
