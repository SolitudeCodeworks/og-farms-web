import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateTierRules } from "@/lib/pricing-engine"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ruleId } = await params
    const body = await request.json()
    const minQuantity = Number(body.minQuantity)
    const maxQuantity = body.maxQuantity === "" || body.maxQuantity === null || body.maxQuantity === undefined
      ? null
      : Number(body.maxQuantity)
    const tierPrice = Number(body.tierPrice)

    if (!Number.isFinite(minQuantity) || minQuantity < 2) {
      return NextResponse.json({ error: "Min quantity must be at least 2" }, { status: 400 })
    }

    if (!Number.isFinite(tierPrice) || tierPrice <= 0) {
      return NextResponse.json({ error: "Tier price must be greater than 0" }, { status: 400 })
    }

    if (maxQuantity !== null && (!Number.isFinite(maxQuantity) || maxQuantity < minQuantity)) {
      return NextResponse.json({ error: "Max quantity must be greater than or equal to min quantity" }, { status: 400 })
    }

    const existingRule = await prisma.bulkPricingRule.findUnique({
      where: { id: ruleId },
      include: { product: { select: { category: true } } },
    })

    if (!existingRule) {
      return NextResponse.json({ error: "Bulk pricing rule not found" }, { status: 404 })
    }

    if (existingRule.product.category !== "FLOWER" && existingRule.product.category !== "PRE_ROLLS") {
      return NextResponse.json({ error: "Bulk pricing is only editable for Flower and Pre-Rolls" }, { status: 400 })
    }

    const sameProductRules = await prisma.bulkPricingRule.findMany({
      where: {
        productId: existingRule.productId,
        isActive: true,
        id: { not: ruleId },
        rangeKey: null,
      },
      orderBy: { minQuantity: "asc" },
    })

    const validation = validateTierRules([
      ...sameProductRules.map((rule) => ({ minQuantity: rule.minQuantity, maxQuantity: rule.maxQuantity })),
      { minQuantity, maxQuantity },
    ])

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const updated = await prisma.bulkPricingRule.update({
      where: { id: ruleId },
      data: {
        minQuantity,
        maxQuantity,
        tierPrice,
      },
    })

    return NextResponse.json({ rule: updated })
  } catch (error) {
    console.error("Error updating bulk pricing rule:", error)
    return NextResponse.json({ error: "Failed to update bulk pricing rule" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ ruleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { ruleId } = await params

    const existingRule = await prisma.bulkPricingRule.findUnique({
      where: { id: ruleId },
      select: { id: true },
    })

    if (!existingRule) {
      return NextResponse.json({ error: "Bulk pricing rule not found" }, { status: 404 })
    }

    await prisma.bulkPricingRule.update({
      where: { id: ruleId },
      data: { isActive: false },
    })

    return NextResponse.json({ message: "Bulk pricing rule deleted" })
  } catch (error) {
    console.error("Error deleting bulk pricing rule:", error)
    return NextResponse.json({ error: "Failed to delete bulk pricing rule" }, { status: 500 })
  }
}
