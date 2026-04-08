import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, dateOfBirth } = await request.json()

    // Calculate age if dateOfBirth is provided
    let ageVerified = false
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      ageVerified = age >= 18
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        ageVerified: ageVerified ? true : undefined,
        verifiedAt: ageVerified ? new Date() : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        dateOfBirth: true,
        ageVerified: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
