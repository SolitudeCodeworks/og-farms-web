import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cache } from "@/lib/cache"
import { validateTierRules } from "@/lib/pricing-engine"

function normalizeSubcategory(value: string): string {
  return value.trim().toLowerCase()
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subcategoryParam = searchParams.get("subcategory")

    if (!subcategoryParam) {
      return NextResponse.json({ error: "Subcategory is required" }, { status: 400 })
    }

    const subcategory = normalizeSubcategory(subcategoryParam)

    const products = await prisma.product.findMany({
      where: {
        subcategory: { equals: subcategory, mode: "insensitive" },
        category: { in: ["FLOWER", "PRE_ROLLS"] },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    if (products.length === 0) {
      return NextResponse.json({
        subcategory,
        productsCount: 0,
        rules: [],
      })
    }

    const firstProductRules = await prisma.bulkPricingRule.findMany({
      where: {
        productId: products[0].id,
        isActive: true,
        rangeKey: null,
      },
      orderBy: { minQuantity: "asc" },
      select: {
        minQuantity: true,
        maxQuantity: true,
        tierPrice: true,
      },
    })

    return NextResponse.json({
      subcategory,
      productsCount: products.length,
      rules: firstProductRules,
      note: "Rules shown are taken from the first product in this subcategory.",
    })
  } catch (error) {
    console.error("Error fetching subcategory bulk pricing:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { subcategory, rules } = await request.json()

    if (!subcategory || !Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json(
        { error: "Subcategory and at least one tier are required" },
        { status: 400 }
      )
    }

    const normalizedSubcategory = normalizeSubcategory(String(subcategory))

    const validation = validateTierRules(rules)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    for (const rule of rules) {
      if (!rule.minQuantity || Number(rule.minQuantity) < 1) {
        return NextResponse.json({ error: "All tiers need min quantity >= 1" }, { status: 400 })
      }

      if (
        rule.maxQuantity !== null &&
        rule.maxQuantity !== undefined &&
        rule.maxQuantity !== "" &&
        Number(rule.maxQuantity) < Number(rule.minQuantity)
      ) {
        return NextResponse.json({ error: "Max quantity must be >= min quantity" }, { status: 400 })
      }

      if (!rule.tierPrice || Number(rule.tierPrice) <= 0) {
        return NextResponse.json({ error: "All tiers need a tier price > 0" }, { status: 400 })
      }
    }

    const products = await prisma.product.findMany({
      where: {
        subcategory: { equals: normalizedSubcategory, mode: "insensitive" },
        category: { in: ["FLOWER", "PRE_ROLLS"] },
      },
      select: { id: true },
    })

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No eligible products found for this subcategory" },
        { status: 404 }
      )
    }

    const productIds = products.map((p) => p.id)
    const incomingMinQuantities = rules.map((rule: any) => Number(rule.minQuantity))

    await prisma.$transaction(async (tx) => {
      await tx.bulkPricingRule.updateMany({
        where: {
          productId: { in: productIds },
          rangeKey: null,
          minQuantity: { notIn: incomingMinQuantities },
        },
        data: { isActive: false },
      })

      for (const productId of productIds) {
        for (const rule of rules) {
          const minQuantity = Number(rule.minQuantity)
          const maxQuantity =
            rule.maxQuantity === null || rule.maxQuantity === undefined || rule.maxQuantity === ""
              ? null
              : Number(rule.maxQuantity)
          const tierPrice = Number(rule.tierPrice)

          const existingRule = await tx.bulkPricingRule.findFirst({
            where: {
              productId,
              minQuantity,
              rangeKey: null,
            },
            select: { id: true },
          })

          if (existingRule) {
            await tx.bulkPricingRule.update({
              where: { id: existingRule.id },
              data: {
                maxQuantity,
                tierPrice,
                isActive: true,
              },
            })
          } else {
            await tx.bulkPricingRule.create({
              data: {
                productId,
                rangeKey: null,
                minQuantity,
                maxQuantity,
                tierPrice,
                isActive: true,
              },
            })
          }
        }
      }
    })

    cache.invalidatePattern("^products:")

    return NextResponse.json({
      message: "Subcategory bulk deal applied",
      subcategory: normalizedSubcategory,
      productsUpdated: productIds.length,
      tiersApplied: rules.length,
    })
  } catch (error: any) {
    console.error("Error applying subcategory bulk pricing:", error)

    if (error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate tier quantity detected" }, { status: 409 })
    }

    return NextResponse.json({ error: "Failed to apply subcategory bulk pricing" }, { status: 500 })
  }
}
