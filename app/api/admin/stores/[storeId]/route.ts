import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { storeId } = await params

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        _count: {
          select: {
            inventory: true,
            orders: true
          }
        }
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ store })
  } catch (error) {
    console.error("Error fetching store:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { storeId } = await params
    const data = await request.json()

    const store = await prisma.store.update({
      where: { id: storeId },
      data
    })

    return NextResponse.json({ store })
  } catch (error) {
    console.error("Error updating store:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { storeId } = await params

    // Check if store has inventory or orders
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        _count: {
          select: {
            inventory: true,
            orders: true
          }
        }
      }
    })

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      )
    }

    // Prevent deletion if store has inventory or orders
    if (store._count.inventory > 0 || store._count.orders > 0) {
      return NextResponse.json(
        { error: "Cannot delete store with existing inventory or orders" },
        { status: 400 }
      )
    }

    await prisma.store.delete({
      where: { id: storeId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting store:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
