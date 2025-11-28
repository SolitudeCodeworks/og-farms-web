import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to leave a review" },
        { status: 401 }
      )
    }

    const { slug } = await params
    const { rating, title, comment } = await request.json()

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    // Validate comment
    if (!comment || comment.trim() === "") {
      return NextResponse.json(
        { error: "Review comment is required" },
        { status: 400 }
      )
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    // Get user
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

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        productId: product.id
      }
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      )
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId: product.id,
        rating,
        title: title && title.trim() !== "" ? title : null,
        comment: comment.trim()
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    })

    // Update product average rating and total reviews
    const allReviews = await prisma.review.findMany({
      where: { productId: product.id },
      select: { rating: true }
    })

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.product.update({
      where: { id: product.id },
      data: {
        averageRating,
        totalReviews: allReviews.length
      }
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
