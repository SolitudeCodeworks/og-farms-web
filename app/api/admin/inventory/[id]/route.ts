import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
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
    const { quantity } = await request.json()

    if (quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: "Invalid quantity" },
        { status: 400 }
      )
    }

    // Update inventory
    const inventory = await prisma.storeInventory.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true
          }
        },
        store: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error("Error updating inventory:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
