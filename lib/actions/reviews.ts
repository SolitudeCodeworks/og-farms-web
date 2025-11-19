"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createReview(data: {
  productId: string
  rating: number
  title?: string
  comment: string
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  if (data.rating < 1 || data.rating > 5) {
    return { error: "Rating must be between 1 and 5" }
  }

  try {
    // Check if user has purchased this product
    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: data.productId,
        order: {
          userId: session.user.id,
          status: "DELIVERED",
        },
      },
    })

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: data.productId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        verified: !!hasPurchased,
      },
    })

    // Update product average rating and total reviews
    const reviews = await prisma.review.findMany({
      where: { productId: data.productId },
      select: { rating: true },
    })

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await prisma.product.update({
      where: { id: data.productId },
      data: {
        averageRating,
        totalReviews: reviews.length,
      },
    })

    revalidatePath(`/product/${data.productId}`)
    return { success: true, review }
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "You have already reviewed this product" }
    }
    console.error("Error creating review:", error)
    return { error: "Failed to create review" }
  }
}

export async function getProductReviews(productId: string, limit: number = 10) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { verified: "desc" },
        { helpful: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    })

    return { reviews }
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return { reviews: [] }
  }
}

export async function updateReview(reviewId: string, data: {
  rating?: number
  title?: string
  comment?: string
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review || review.userId !== session.user.id) {
      return { error: "Review not found or unauthorized" }
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data,
    })

    // Recalculate average rating
    const reviews = await prisma.review.findMany({
      where: { productId: review.productId },
      select: { rating: true },
    })

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await prisma.product.update({
      where: { id: review.productId },
      data: { averageRating },
    })

    revalidatePath(`/product/${review.productId}`)
    return { success: true, review: updatedReview }
  } catch (error) {
    console.error("Error updating review:", error)
    return { error: "Failed to update review" }
  }
}

export async function deleteReview(reviewId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Not authenticated" }
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review || review.userId !== session.user.id) {
      return { error: "Review not found or unauthorized" }
    }

    await prisma.review.delete({
      where: { id: reviewId },
    })

    // Recalculate average rating
    const reviews = await prisma.review.findMany({
      where: { productId: review.productId },
      select: { rating: true },
    })

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        averageRating,
        totalReviews: reviews.length,
      },
    })

    revalidatePath(`/product/${review.productId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting review:", error)
    return { error: "Failed to delete review" }
  }
}

export async function markReviewHelpful(reviewId: string) {
  try {
    await prisma.review.update({
      where: { id: reviewId },
      data: {
        helpful: {
          increment: 1,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error marking review helpful:", error)
    return { error: "Failed to mark review helpful" }
  }
}
