import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { del } from "@vercel/blob"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const data = await request.json()
    const {
      name,
      slug,
      description,
      price,
      category,
      subcategory,
      thcContent,
      cbdContent,
      strain,
      images,
      featured,
      ageRestricted
    } = data

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price,
        category,
        subcategory: subcategory && subcategory.trim() !== "" ? subcategory : null,
        thcContent: thcContent && thcContent.trim() !== "" ? thcContent : null,
        cbdContent: cbdContent && cbdContent.trim() !== "" ? cbdContent : null,
        strain: strain && strain.trim() !== "" ? strain : null,
        images,
        featured,
        ageRestricted
      }
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error updating product:", error)
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
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    
    // Get product to access image URLs and check for orders
    const product = await prisma.product.findUnique({
      where: { id },
      select: { 
        images: true,
        _count: {
          select: {
            orderItems: true,
            cartItems: true,
            wishlistItems: true
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Check if product has any orders
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        { error: `Cannot delete product. It has ${product._count.orderItems} order(s) associated with it. Consider marking it as inactive instead.` },
        { status: 400 }
      )
    }

    // Delete related cart items and wishlist items first
    if (product._count.cartItems > 0) {
      await prisma.cartItem.deleteMany({
        where: { productId: id }
      })
    }

    if (product._count.wishlistItems > 0) {
      await prisma.wishlistItem.deleteMany({
        where: { productId: id }
      })
    }

    // Delete all inventory entries for this product across all stores
    await prisma.storeInventory.deleteMany({
      where: { productId: id }
    })

    // Delete product from database
    await prisma.product.delete({
      where: { id }
    })

    // Delete images from Vercel Blob
    if (product.images && product.images.length > 0) {
      try {
        for (const imageUrl of product.images) {
          // Only delete if it's a Vercel Blob URL
          if (imageUrl.includes('vercel-storage.com') || imageUrl.includes('blob.vercel-storage.com')) {
            await del(imageUrl, {
              token: process.env.BLOB_READ_WRITE_TOKEN
            })
            console.log('Deleted image from blob:', imageUrl)
          }
        }
      } catch (blobError) {
        // Log error but don't fail the request since product is already deleted
        console.error('Error deleting images from blob:', blobError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
