import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      ageVerified: true,
      dateOfBirth: true,
    },
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }
  
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden: Admin access required")
  }
  
  return user
}

export async function requireAgeVerification() {
  const user = await requireAuth()
  
  if (!user.ageVerified) {
    throw new Error("Age verification required")
  }
  
  return user
}

export function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export function isOver18(dateOfBirth: Date): boolean {
  return calculateAge(dateOfBirth) >= 18
}
