import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { dateOfBirth } = await request.json()

    if (!dateOfBirth) {
      return NextResponse.json(
        { error: "Date of birth is required" },
        { status: 400 }
      )
    }

    // Calculate age
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    if (age < 18) {
      return NextResponse.json(
        { error: "You must be 18 or older" },
        { status: 400 }
      )
    }

    // Update user
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        dateOfBirth: birthDate,
        ageVerified: true,
        verifiedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          ageVerified: user.ageVerified,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Age verification error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
