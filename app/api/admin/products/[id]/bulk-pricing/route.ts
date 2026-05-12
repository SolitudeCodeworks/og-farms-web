import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cache } from "@/lib/cache"
import { validateTierRules } from "@/lib/pricing-engine"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get product and its bulk pricing rules
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        bulkPricingRules: {
          where: { isActive: true },
          orderBy: { minQuantity: 'asc' }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        price: product.price,
      },
      rules: product.bulkPricingRules
    })
  } catch (error) {
    console.error("Error fetching product bulk pricing:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { rules } = await request.json()

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true, category: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Only allow bulk pricing for Flower and Pre-Rolls
    if (product.category !== "FLOWER" && product.category !== "PRE_ROLLS") {
      return NextResponse.json(
        { error: "Bulk pricing only available for Flower and Pre-Rolls" },
        { status: 400 }
      )
    }

    // Validate tier rules
    if (!Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json(
        { error: "At least one pricing tier required" },
        { status: 400 }
      )
    }

    const validation = validateTierRules(rules)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Validate all required fields
    for (const rule of rules) {
      if (!rule.minQuantity || rule.minQuantity < 1) {
        return NextResponse.json(
          { error: "All tiers must have minQuantity >= 1" },
          { status: 400 }
        )
      }
      if (rule.maxQuantity !== null && rule.maxQuantity !== undefined && rule.maxQuantity !== '' && Number(rule.maxQuantity) < Number(rule.minQuantity)) {
        return NextResponse.json(
          { error: "Max quantity must be greater than or equal to min quantity" },
          { status: 400 }
        )
      }
      if (!rule.tierPrice || rule.tierPrice <= 0) {
        return NextResponse.json(
          { error: "All tiers must have tierPrice > 0" },
          { status: 400 }
        )
      }
    }

    // Update rules in transaction: delete old, create new
    await prisma.$transaction(async (tx) => {
      // Delete existing rules for this product (soft delete via isActive = false)
      await tx.bulkPricingRule.updateMany({
        where: { productId: id },
        data: { isActive: false }
      })

      // Create new rules
      await tx.bulkPricingRule.createMany({
        data: rules.map((rule: any) => ({
          productId: id,
          rangeKey: null, // Product-level override
          minQuantity: rule.minQuantity,
          maxQuantity: rule.maxQuantity || null,
          tierPrice: rule.tierPrice,
          isActive: true,
        }))
      })
    })

    // Invalidate cache
    cache.invalidatePattern('^products:')

    const updated = await prisma.product.findUnique({
      where: { id },
      include: {
        bulkPricingRules: {
          where: { isActive: true },
          orderBy: { minQuantity: 'asc' }
        }
      }
    })

    return NextResponse.json(
      { 
        message: "Bulk pricing rules updated",
        rules: updated?.bulkPricingRules 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error updating bulk pricing:", error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Duplicate quantity tier for this product" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update bulk pricing rules" },
      { status: 500 }
    )
  }
}
