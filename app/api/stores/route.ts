import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        phone: true,
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ stores })
  } catch (error) {
    console.error("Error fetching stores:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
