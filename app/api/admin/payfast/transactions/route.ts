import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import crypto from "crypto"

function generateSignature(params: Record<string, string>, passphrase: string): string {
  // Add passphrase and sort keys alphabetically
  const withPassphrase: Record<string, string> = { ...params, passphrase }
  const sorted = Object.keys(withPassphrase)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = withPassphrase[key]
      return acc
    }, {})

  const queryString = new URLSearchParams(sorted).toString()
  return crypto.createHash("md5").update(queryString).digest("hex")
}

function buildHeaders(queryParams: Record<string, string> = {}) {
  const merchantId = process.env.NEXT_PUBLIC_PAYFAST_MERCHANT_ID || "32888465"
  const passphrase = process.env.PAYFAST_PASSPHRASE || ""
  const isSandbox = process.env.NEXT_PUBLIC_PAYFAST_MODE !== "live"

  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "+02:00").slice(0, 19) + "+02:00"
  const version = "v1"

  const allParams: Record<string, string> = {
    "merchant-id": merchantId,
    version,
    timestamp,
    ...(isSandbox ? { testing: "true" } : {}),
    ...queryParams,
  }

  const signature = generateSignature(allParams, passphrase)

  return {
    "merchant-id": merchantId,
    version,
    timestamp,
    signature,
    ...(isSandbox ? { testing: "true" } : {}),
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "monthly" // monthly | weekly | daily | range
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const date = searchParams.get("date")

    const isSandbox = process.env.NEXT_PUBLIC_PAYFAST_MODE !== "live"
    const baseUrl = isSandbox
      ? "https://api.payfast.co.za"
      : "https://api.payfast.co.za"

    if (!process.env.PAYFAST_PASSPHRASE) {
      return NextResponse.json(
        { error: "PAYFAST_PASSPHRASE is not configured in environment variables" },
        { status: 500 }
      )
    }

    let url: string
    const queryParams: Record<string, string> = {}

    if (type === "range") {
      // GET /transactions/history?from=:date&to=:date
      if (from) queryParams.from = from
      if (to) queryParams.to = to
      const qs = new URLSearchParams(queryParams).toString()
      url = `${baseUrl}/transactions/history${qs ? `?${qs}` : ""}${isSandbox ? (qs ? "&testing=true" : "?testing=true") : ""}`
    } else {
      // GET /transactions/history/daily|weekly|monthly?date=:date
      if (date) queryParams.date = date
      const qs = new URLSearchParams(queryParams).toString()
      url = `${baseUrl}/transactions/history/${type}${qs ? `?${qs}` : ""}${isSandbox ? (qs ? "&testing=true" : "?testing=true") : ""}`
    }

    const headers = buildHeaders(queryParams)

    const pfResponse = await fetch(url, { headers })

    if (!pfResponse.ok) {
      const errText = await pfResponse.text()
      console.error("PayFast API error:", pfResponse.status, errText)
      return NextResponse.json(
        { error: `PayFast API returned ${pfResponse.status}`, detail: errText },
        { status: pfResponse.status }
      )
    }

    const csv = await pfResponse.text()

    // Parse CSV into array of objects
    const lines = csv.trim().split("\n").filter(Boolean)
    if (lines.length < 2) {
      return NextResponse.json({ transactions: [], raw: csv })
    }

    const headers_row = lines[0]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, ""))

    const transactions = lines.slice(1).map((line) => {
      // Handle quoted fields with commas inside
      const values: string[] = []
      let current = ""
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') {
          inQuotes = !inQuotes
        } else if (ch === "," && !inQuotes) {
          values.push(current.trim())
          current = ""
        } else {
          current += ch
        }
      }
      values.push(current.trim())

      return headers_row.reduce<Record<string, string>>((obj, key, i) => {
        obj[key] = values[i] ?? ""
        return obj
      }, {})
    })

    return NextResponse.json({ transactions, raw: csv })
  } catch (error) {
    console.error("Error fetching PayFast transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
