import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rules = await prisma.bulkPricingRule.findMany({
      where: {
        isActive: true,
        rangeKey: null,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            subcategory: true,
            price: true,
          },
        },
      },
      orderBy: [
        { productId: "asc" },
        { minQuantity: "asc" },
      ],
    })

    return NextResponse.json({ rules })
  } catch (error) {
    console.error("Error fetching bulk pricing rules:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
