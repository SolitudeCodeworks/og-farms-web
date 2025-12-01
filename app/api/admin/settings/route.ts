import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const settings = await prisma.siteSettings.findMany({
      where: category ? { category } : undefined,
      orderBy: { key: 'asc' }
    })
    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })
    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    const body = await request.json()
    const { settings } = body
    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: "Settings must be an array" }, { status: 400 })
    }
    const results = await Promise.all(
      settings.map(({ key, value, category, description }) =>
        prisma.siteSettings.upsert({
          where: { key },
          update: { value, category, description },
          create: { key, value, category: category || "general", description }
        })
      )
    )
    return NextResponse.json({ message: "Settings updated successfully", count: results.length })
  } catch (error) {
    console.error("Error bulk updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
