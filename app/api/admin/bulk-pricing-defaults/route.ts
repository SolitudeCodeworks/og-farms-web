/**
 * Range-based Bulk Pricing Defaults API
 * 
 * Manages system-wide pricing tiers for each range (Landrace, Greens, Indoor, Connoisseur, Medical)
 * Creates seed rules that automatically apply to all products in that range unless overridden
 */

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cache } from "@/lib/cache"
import { validateTierRules } from "@/lib/pricing-engine"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all range-based pricing rules (rangeKey is NOT null)
    const rangeDefaults = await prisma.bulkPricingRule.findMany({
      where: {
        rangeKey: { not: null },
        isActive: true
      },
      distinct: ['rangeKey'],
      select: {
        rangeKey: true
      }
    })

    // Fetch rules for each range
    const rules: Record<string, any[]> = {}
    for (const range of rangeDefaults) {
      if (range.rangeKey) {
        rules[range.rangeKey] = await prisma.bulkPricingRule.findMany({
          where: {
            rangeKey: range.rangeKey,
            isActive: true
          },
          orderBy: { minQuantity: 'asc' }
        })
      }
    }

    return NextResponse.json({ ranges: rules })
  } catch (error) {
    console.error("Error fetching range defaults:", error)
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

    const { range, rules } = await request.json()

    if (!range || !Array.isArray(rules) || rules.length === 0) {
      return NextResponse.json(
        { error: "Range name and at least one tier required" },
        { status: 400 }
      )
    }

    // Validate tier structure
    const validation = validateTierRules(rules)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Validate all required fields
    for (const rule of rules) {
      if (!rule.minQuantity || rule.minQuantity < 2) {
        return NextResponse.json(
          { error: "All tiers must have minQuantity >= 2" },
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

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Deactivate old rules for this range
      await tx.bulkPricingRule.updateMany({
        where: {
          rangeKey: range,
        },
        data: { isActive: false }
      })

      // Create new rules for this range
      await tx.bulkPricingRule.createMany({
        data: rules.map((rule: any) => ({
          rangeKey: range,
          productId: "RANGE_DEFAULT", // Placeholder — actual lookup is by rangeKey
          minQuantity: rule.minQuantity,
          maxQuantity: rule.maxQuantity || null,
          tierPrice: rule.tierPrice,
          isActive: true,
        }))
      })
    })

    // Invalidate cache
    cache.invalidatePattern('^products:')

    return NextResponse.json(
      { message: `Bulk pricing for ${range} updated successfully` },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Error updating range defaults:", error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Duplicate quantity tier for this range" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update range pricing defaults" },
      { status: 500 }
    )
  }
}
