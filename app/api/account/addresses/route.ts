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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const { fullName, street, city, state, zipCode, country, phone, isDefault } = await request.json()

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName,
        street,
        city,
        state,
        zipCode,
        country: country || "South Africa",
        phone,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (error) {
    console.error("Error creating address:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
