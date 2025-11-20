"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function syncCartToDatabase(cartItems: Array<{
  productId: string
  quantity: number
}>) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  try {
    // Clear existing cart items
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    // Add new cart items
    if (cartItems.length > 0) {
      await prisma.cartItem.createMany({
        data: cartItems.map((item) => ({
          userId: session.user.id,
          productId: item.productId,
          quantity: item.quantity,
        })),
      })
    }

    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("Error syncing cart:", error)
    return { error: "Failed to sync cart" }
  }
}

export async function getCartFromDatabase() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { items: [] }
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
            category: true,
            stock: true,
          },
        },
      },
    })

    return {
      items: cartItems.map((item: any) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.images[0] || "/products/placeholder.jpg",
        quantity: item.quantity,
        category: item.product.category,
      })),
    }
  } catch (error) {
    console.error("Error fetching cart:", error)
    return { items: [] }
  }
}

export async function addToCart(productId: string, quantity: number = 1) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Not authenticated", useLocalStorage: true }
  }

  try {
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      await prisma.cartItem.create({
        data: {
          userId: session.user.id,
          productId,
          quantity,
        },
      })
    }

    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return { error: "Failed to add to cart" }
  }
}

export async function updateCartItemQuantity(productId: string, quantity: number) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  try {
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      })
    } else {
      await prisma.cartItem.update({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
        data: { quantity },
      })
    }

    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("Error updating cart item:", error)
    return { error: "Failed to update cart item" }
  }
}

export async function removeFromCart(productId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("Error removing from cart:", error)
    return { error: "Failed to remove from cart" }
  }
}

export async function clearCart() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  try {
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id },
    })

    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("Error clearing cart:", error)
    return { error: "Failed to clear cart" }
  }
}
