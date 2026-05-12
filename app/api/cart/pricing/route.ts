import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateOrderTotals } from "@/lib/pricing-engine"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const items = Array.isArray(body?.items) ? body.items : []

    if (items.length === 0) {
      return NextResponse.json({
        subtotal: 0,
        bulkDiscountAmount: 0,
        lineItems: [],
      })
    }

    const normalizedItems = items
      .map((item: any) => ({
        productId: String(item.productId || item.id || ""),
        quantity: Number(item.quantity || 0),
      }))
      .filter((item: { productId: string; quantity: number }) => item.productId && item.quantity > 0)

    if (normalizedItems.length === 0) {
      return NextResponse.json({
        subtotal: 0,
        bulkDiscountAmount: 0,
        lineItems: [],
      })
    }

    const productIds = normalizedItems.map((item: { productId: string }) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        price: true,
        category: true,
        subcategory: true,
      },
    })

    const productMap = new Map(products.map((product) => [product.id, product]))

    const itemsWithProducts = normalizedItems
      .map((item: { productId: string; quantity: number }) => {
        const product = productMap.get(item.productId)
        if (!product) return null

        return {
          productId: item.productId,
          quantity: item.quantity,
          product: {
            price: product.price,
            category: product.category,
            subcategory: product.subcategory,
          },
        }
      })
      .filter(Boolean) as Array<{
        productId: string
        quantity: number
        product: {
          price: number
          category: string
          subcategory: string | null
        }
      }>

    if (itemsWithProducts.length === 0) {
      return NextResponse.json({
        subtotal: 0,
        bulkDiscountAmount: 0,
        lineItems: [],
      })
    }

    const breakdown = await calculateOrderTotals(itemsWithProducts)

    const lineItems = breakdown.lineBreakdowns.map((line, index) => ({
      productId: itemsWithProducts[index].productId,
      quantity: line.quantity,
      baseUnitPrice: line.basePrice,
      baseLineTotal: line.subtotal,
      lineTotal: line.effectivePrice,
      effectiveUnitPrice: line.effectivePrice / Math.max(1, line.quantity),
      bulkDiscount: line.bulkDiscount,
      bulkTier: line.bulkTier,
    }))

    return NextResponse.json({
      subtotal: breakdown.subtotal,
      baseSubtotal: breakdown.baseSubtotal,
      bulkDiscountAmount: breakdown.bulkDiscountAmount,
      lineItems,
    })
  } catch (error) {
    console.error("Error calculating cart pricing:", error)
    return NextResponse.json(
      { error: "Failed to calculate cart pricing" },
      { status: 500 }
    )
  }
}
