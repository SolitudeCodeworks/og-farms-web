import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ isFavorite: false })
    }

    const { productId } = await params

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ isFavorite: false })
    }

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: user.id,
        productId: productId
      }
    })

    return NextResponse.json({ isFavorite: !!wishlistItem })
  } catch (error) {
    console.error("Error checking wishlist:", error)
    return NextResponse.json({ isFavorite: false })
  }
}
