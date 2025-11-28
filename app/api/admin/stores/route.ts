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

    const stores = await prisma.store.findMany({
      include: {
        _count: {
          select: {
            inventory: true,
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ stores })
  } catch (error) {
    console.error("Error fetching stores:", error)
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

    const data = await request.json()
    const {
      name,
      slug,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      latitude,
      longitude,
      openingHours,
      isActive,
      allowsPickup
    } = data

    const store = await prisma.store.create({
      data: {
        name,
        slug,
        address,
        city,
        state,
        zipCode,
        country: country || "South Africa",
        phone,
        email,
        latitude,
        longitude,
        openingHours,
        isActive: isActive !== undefined ? isActive : true,
        allowsPickup: allowsPickup !== undefined ? allowsPickup : true
      }
    })

    return NextResponse.json({ store }, { status: 201 })
  } catch (error) {
    console.error("Error creating store:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
