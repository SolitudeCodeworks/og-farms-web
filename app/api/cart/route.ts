import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to add items to cart" },
        { status: 401 }
      )
    }

    const { productId, quantity } = await request.json()

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Invalid product or quantity" },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        ageVerified: true,
        dateOfBirth: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        id: true, 
        name: true,
        ageRestricted: true 
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check stock availability
    const inventory = await prisma.storeInventory.findMany({
      where: { productId },
      select: { quantity: true }
    })

    const totalStock = inventory.reduce((sum, item) => sum + item.quantity, 0)

    if (totalStock < quantity) {
      return NextResponse.json(
        { error: `Insufficient stock. Only ${totalStock} available.` },
        { status: 400 }
      )
    }

    // Check age restriction
    if (product.ageRestricted) {
      if (!user.ageVerified || !user.dateOfBirth) {
        return NextResponse.json(
          { error: "Age verification required. Please update your profile with your date of birth." },
          { status: 403 }
        )
      }

      // Calculate age
      const birthDate = new Date(user.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      if (age < 18) {
        return NextResponse.json(
          { error: "You must be 18 or older to purchase this product" },
          { status: 403 }
        )
      }
    }

    // Check if item already in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        productId: productId
      }
    })

    if (existingCartItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity
        }
      })

      return NextResponse.json({ 
        message: "Cart updated",
        cartItem: updatedItem 
      })
    } else {
      // Create new cart item
      const cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId: productId,
          quantity: quantity
        }
      })

      return NextResponse.json({ 
        message: "Added to cart",
        cartItem 
      }, { status: 201 })
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
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

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: true
      }
    })

    return NextResponse.json({ cartItems })
  } catch (error) {
    console.error("Error fetching cart:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
