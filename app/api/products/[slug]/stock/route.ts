import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get product
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Get total stock across all stores
    const inventory = await prisma.storeInventory.findMany({
      where: { productId: product.id },
      select: {
        quantity: true,
        store: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const disableStockChecksSetting = await prisma.siteSettings.findUnique({
      where: { key: 'disable_stock_checks' }
    })
    const disableStockChecks = disableStockChecksSetting?.value === 'true'

    let totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0)
    let inStock = totalStock > 0

    if (disableStockChecks && !inStock) {
      totalStock = 999
      inStock = true
    }

    return NextResponse.json({
      totalStock,
      inStock,
      disableStockChecks,
      stores: inventory.map(item => ({
        storeId: item.store.id,
        storeName: item.store.name,
        quantity: item.quantity
      }))
    })
  } catch (error) {
    console.error("Error fetching stock:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
