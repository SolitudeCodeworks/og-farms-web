import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      )
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
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

    return NextResponse.json({ address })
  } catch (error) {
    console.error("Error updating address:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Verify address belongs to user
    const existingAddress = await prisma.address.findFirst({
      where: { id, userId: user.id },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 404 }
      )
    }

    await prisma.address.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
