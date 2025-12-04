import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { items } = await request.json()

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get existing cart items
    const existingItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      select: { productId: true, quantity: true, id: true }
    })

    // Create maps for efficient lookup
    const existingMap = new Map(existingItems.map(item => [item.productId, item]))
    const newMap = new Map(items.map((item: { productId: string; quantity: number }) => [item.productId, item]))

    // Find items to delete (in DB but not in new cart)
    const itemsToDelete = existingItems.filter(item => !newMap.has(item.productId))
    
    // Find items to update (in both, but quantity changed)
    const itemsToUpdate = items.filter((item: { productId: string; quantity: number }) => {
      const existing = existingMap.get(item.productId)
      return existing && existing.quantity !== item.quantity
    })

    // Find items to create (in new cart but not in DB)
    const itemsToCreate = items.filter((item: { productId: string; quantity: number }) => 
      !existingMap.has(item.productId)
    )

    // Execute operations
    if (itemsToDelete.length > 0) {
      await prisma.cartItem.deleteMany({
        where: {
          userId: user.id,
          productId: { in: itemsToDelete.map(item => item.productId) }
        }
      })
    }

    if (itemsToUpdate.length > 0) {
      await Promise.all(
        itemsToUpdate.map((item: { productId: string; quantity: number }) =>
          prisma.cartItem.update({
            where: {
              userId_productId: {
                userId: user.id,
                productId: item.productId
              }
            },
            data: { quantity: item.quantity }
          })
        )
      )
    }

    if (itemsToCreate.length > 0) {
      await prisma.cartItem.createMany({
        data: itemsToCreate.map((item: { productId: string; quantity: number }) => ({
          userId: user.id,
          productId: item.productId,
          quantity: item.quantity
        }))
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error syncing cart:", error)
    return NextResponse.json(
      { error: "Failed to sync cart" },
      { status: 500 }
    )
  }
}
