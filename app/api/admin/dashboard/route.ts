import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get all stats in parallel
    const [
      totalStores,
      activeStores,
      totalProducts,
      lowStockItems,
      pendingOrders,
      totalOrders,
      totalUsers,
      revenueData
    ] = await Promise.all([
      prisma.store.count(),
      prisma.store.count({ where: { isActive: true } }),
      prisma.product.count(),
      prisma.storeInventory.count({ where: { quantity: { lte: 10 } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } }
      })
    ])

    return NextResponse.json({
      totalStores,
      activeStores,
      totalProducts,
      lowStockItems,
      pendingOrders,
      totalOrders,
      totalUsers,
      totalRevenue: revenueData._sum.total || 0
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
