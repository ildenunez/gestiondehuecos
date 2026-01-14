import { type NextRequest, NextResponse } from "next/server"
import { getLocations, createLocation } from "@/lib/db"

export async function GET() {
  try {
    const results = await getLocations()
    return NextResponse.json(results)
  } catch (error: any) {
    console.error("[v0] Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newLocation = await createLocation(body)
    return NextResponse.json({ success: true, data: newLocation })
  } catch (error: any) {
    console.error("[v0] Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
