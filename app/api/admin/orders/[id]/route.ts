import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { status } = await request.json()

    // Get the order with items and store info
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        },
        pickupStore: true
      }
    })

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // If changing to CANCELLED or REFUNDED, restore stock
    if ((status === "CANCELLED" || status === "REFUNDED") && 
        existingOrder.status !== "CANCELLED" && 
        existingOrder.status !== "REFUNDED") {
      
      // Restore stock for each item
      for (const item of existingOrder.items) {
        if (existingOrder.pickupStoreId) {
          // Restore stock to the pickup store
          await prisma.storeInventory.updateMany({
            where: {
              productId: item.productId,
              storeId: existingOrder.pickupStoreId
            },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          })
        }
        // Note: For delivery orders, you might want to restore to a default warehouse
        // or handle differently based on your inventory system
      }
    }

    // Update the order status
    const order = await prisma.order.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
