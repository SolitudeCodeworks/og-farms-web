import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cache } from "@/lib/cache"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const inventory = await prisma.storeInventory.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true
          }
        },
        store: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      },
      orderBy: [
        { quantity: 'asc' },
        { product: { name: 'asc' } }
      ]
    })

    return NextResponse.json({ inventory })
  } catch (error) {
    console.error("Error fetching inventory:", error)
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

    const { storeId, productId, quantity, lowStockAlert } = await request.json()

    // Check if inventory already exists for this store/product combination
    const existing = await prisma.storeInventory.findUnique({
      where: {
        storeId_productId: {
          storeId,
          productId
        }
      }
    })

    let inventory

    if (existing) {
      // Update existing inventory by adding to quantity
      inventory = await prisma.storeInventory.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
          lowStockAlert
        },
        include: {
          product: {
            select: {
              name: true,
              images: true
            }
          },
          store: {
            select: {
              name: true,
              city: true
            }
          }
        }
      })
    } else {
      // Create new inventory record
      inventory = await prisma.storeInventory.create({
        data: {
          storeId,
          productId,
          quantity,
          lowStockAlert
        },
        include: {
          product: {
            select: {
              name: true,
              images: true
            }
          },
          store: {
            select: {
              name: true,
              city: true
            }
          }
        }
      })
    }

    // Invalidate inventory cache
    cache.invalidatePattern('^inventory:')

    return NextResponse.json({ inventory }, { status: 201 })
  } catch (error) {
    console.error("Error adding inventory:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
