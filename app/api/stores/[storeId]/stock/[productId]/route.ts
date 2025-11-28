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

    return NextResponse.json({
      quantity: inventory?.quantity || 0
    })
  } catch (error) {
    console.error("Error fetching store stock:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
