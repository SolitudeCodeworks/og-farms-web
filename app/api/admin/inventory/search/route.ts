import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const storeId = searchParams.get('storeId') || ''

    // Get all products
    const products = await prisma.product.findMany({
      where: search
        ? {
            name: { contains: search, mode: 'insensitive' }
          }
        : undefined,
      select: {
        id: true,
        name: true,
        images: true,
        storeInventory: {
          where: storeId ? { storeId } : undefined,
          select: {
            id: true,
            storeId: true,
            quantity: true,
            lowStockAlert: true,
            store: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Get all stores for products without inventory
    const allStores = await prisma.store.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        city: true
      }
    })

    // Transform data to include products without inventory
    const result = products.flatMap(product => {
      if (storeId) {
        // If filtering by store, only show that store's inventory
        const existingInventory = product.storeInventory[0]
        if (existingInventory) {
          return [{
            id: existingInventory.id,
            productId: product.id,
            productName: product.name,
            productImages: product.images,
            storeId: existingInventory.store.id,
            storeName: existingInventory.store.name,
            storeCity: existingInventory.store.city,
            quantity: existingInventory.quantity,
            lowStockAlert: existingInventory.lowStockAlert,
            hasInventory: true
          }]
        } else {
          // Show product without inventory for this store
          const store = allStores.find(s => s.id === storeId)
          if (store) {
            return [{
              id: null,
              productId: product.id,
              productName: product.name,
              productImages: product.images,
              storeId: store.id,
              storeName: store.name,
              storeCity: store.city,
              quantity: 0,
              lowStockAlert: 10,
              hasInventory: false
            }]
          }
        }
      } else {
        // If not filtering by store, show all stores for each product
        const inventoryMap = new Map(
          product.storeInventory.map((inv: any) => [inv.storeId, inv])
        )

        return allStores.map(store => {
          const existingInventory = inventoryMap.get(store.id)
          return {
            id: existingInventory?.id || null,
            productId: product.id,
            productName: product.name,
            productImages: product.images,
            storeId: store.id,
            storeName: store.name,
            storeCity: store.city,
            quantity: existingInventory?.quantity || 0,
            lowStockAlert: existingInventory?.lowStockAlert || 10,
            hasInventory: !!existingInventory
          }
        })
      }

      return []
    })

    return NextResponse.json({ items: result })
  } catch (error) {
    console.error("Error searching inventory:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
