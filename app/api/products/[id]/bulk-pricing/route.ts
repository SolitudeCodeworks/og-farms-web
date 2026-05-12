import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        category: true,
        bulkPricingRules: {
          where: {
            isActive: true,
            rangeKey: null,
          },
          orderBy: { minQuantity: "asc" },
          select: {
            minQuantity: true,
            maxQuantity: true,
            tierPrice: true,
            rangeKey: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.category !== "FLOWER" && product.category !== "PRE_ROLLS") {
      return NextResponse.json({ rules: [] })
    }

    return NextResponse.json({ rules: product.bulkPricingRules })
  } catch (error) {
    console.error("Error fetching public product bulk pricing:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
