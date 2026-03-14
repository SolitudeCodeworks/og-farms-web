import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const { storeId, productId } = await params

    const inventory = await prisma.storeInventory.findUnique({
      where: {
        storeId_productId: {
          storeId,
          productId
        }
      },
      select: {
        quantity: true
      }
    })

    const disableStockChecksSetting = await prisma.siteSettings.findUnique({
      where: { key: 'disable_stock_checks' }
    })
    const disableStockChecks = disableStockChecksSetting?.value === 'true'

    let quantity = inventory?.quantity || 0
    if (disableStockChecks && quantity === 0) {
      quantity = 999
    }

    return NextResponse.json({
      quantity,
      disableStockChecks
    })
  } catch (error) {
    console.error("Error fetching store stock:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
