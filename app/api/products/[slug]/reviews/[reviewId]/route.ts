import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string; reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      )
    }

    const { reviewId } = await params

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, productId: true }
    })

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    // Only allow admins or the review owner to delete
    if (user.role !== 'ADMIN' && review.userId !== user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this review" },
        { status: 403 }
      )
    }

    // Delete review
    await prisma.review.delete({
      where: { id: reviewId }
    })

    // Recalculate product average rating
    const allReviews = await prisma.review.findMany({
      where: { productId: review.productId },
      select: { rating: true }
    })

    const averageRating = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        averageRating,
        totalReviews: allReviews.length
      }
    })

    return NextResponse.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string; reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to update a review" },
        { status: 401 }
      )
    }

    const { slug, reviewId } = await params
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

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { userId: true, productId: true }
    })

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      )
    }

    if (existingReview.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own reviews" },
        { status: 403 }
      )
    }

    // Update review
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        title: title && title.trim() !== "" ? title : null,
        comment: comment.trim()
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Recalculate product average rating
    const allReviews = await prisma.review.findMany({
      where: { productId: existingReview.productId },
      select: { rating: true }
    })

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.product.update({
      where: { id: existingReview.productId },
      data: {
        averageRating,
        totalReviews: allReviews.length
      }
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
