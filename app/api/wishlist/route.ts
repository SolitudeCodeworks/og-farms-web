import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      )
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

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

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findFirst({
      where: {
        userId: user.id,
        productId: productId
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: "Product already in wishlist" },
        { status: 400 }
      )
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId: productId
      }
    })

    return NextResponse.json({ wishlistItem }, { status: 201 })
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      )
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

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

    await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId: productId
      }
    })

    return NextResponse.json({ message: "Removed from wishlist" })
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
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
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: true
      }
    })

    return NextResponse.json({ wishlistItems })
  } catch (error) {
    console.error("Error fetching wishlist:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
