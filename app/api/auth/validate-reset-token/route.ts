import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      )
    }

    // Find user with this reset token
    const user = await prisma.user.findUnique({
      where: { resetPasswordToken: token },
      select: {
        id: true,
        resetPasswordExpires: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid reset token" },
        { status: 400 }
      )
    }

    // Check if token has expired
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      )
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json(
      { error: "Failed to validate token" },
      { status: 500 }
    )
  }
}
