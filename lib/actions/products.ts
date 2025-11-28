"use server"

import { prisma } from "@/lib/prisma"

export async function getFrequentlyBoughtTogether(productId: string, limit: number = 4) {
  try {
    const frequentlyBought = await prisma.frequentlyBoughtTogether.findMany({
      where: { productAId: productId },
      include: {
        productB: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            compareAtPrice: true,
            images: true,
            category: true,
            averageRating: true,
            totalReviews: true,
          },
        },
      },
      orderBy: { count: "desc" },
      take: limit,
    })

    return {
      products: frequentlyBought.map((item: any) => item.productB),
    }
  } catch (error) {
    console.error("Error fetching frequently bought together:", error)
    return { products: [] }
  }
}

export async function updateFrequentlyBoughtTogether(orderItems: string[]) {
  try {
    // Create pairs of products bought together
    for (let i = 0; i < orderItems.length; i++) {
      for (let j = i + 1; j < orderItems.length; j++) {
        const productAId = orderItems[i]
        const productBId = orderItems[j]

        // Update or create for both directions
        await prisma.frequentlyBoughtTogether.upsert({
          where: {
            productAId_productBId: { productAId, productBId },
          },
          update: {
            count: { increment: 1 },
          },
          create: {
            productAId,
            productBId,
            count: 1,
          },
        })

        await prisma.frequentlyBoughtTogether.upsert({
          where: {
            productAId_productBId: { productAId: productBId, productBId: productAId },
          },
          update: {
            count: { increment: 1 },
          },
          create: {
            productAId: productBId,
            productBId: productAId,
            count: 1,
          },
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating frequently bought together:", error)
    return { error: "Failed to update frequently bought together" }
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [
            { verified: "desc" },
            { helpful: "desc" },
            { createdAt: "desc" },
          ],
          take: 10,
        },
      },
    })

    return { product }
  } catch (error) {
    console.error("Error fetching product:", error)
    return { product: null }
  }
}

export async function getProducts(filters?: {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  featured?: boolean
  limit?: number
  offset?: number
}) {
  try {
    const where: any = {}

    if (filters?.category) {
      where.category = filters.category
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {}
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice
      }
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ]
    }

    if (filters?.featured !== undefined) {
      where.featured = filters.featured
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { totalSales: "desc" },
        { createdAt: "desc" },
      ],
      take: filters?.limit || 20,
      skip: filters?.offset || 0,
    })

    const total = await prisma.product.count({ where })

    return { products, total }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { products: [], total: 0 }
  }
}

export async function incrementProductSales(productId: string, quantity: number) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        totalSales: {
          increment: quantity,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error incrementing product sales:", error)
    return { error: "Failed to increment product sales" }
  }
}
