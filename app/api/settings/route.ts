import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Public endpoint to fetch settings (read-only)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const key = searchParams.get('key')

    if (key) {
      // Fetch single setting by key
      const setting = await prisma.siteSettings.findUnique({
        where: { key }
      })

      if (!setting) {
        return NextResponse.json(
          { error: "Setting not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ setting })
    }

    // Fetch all settings or filter by category
    const settings = await prisma.siteSettings.findMany({
      where: category ? { category } : undefined,
      orderBy: { key: 'asc' }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}
