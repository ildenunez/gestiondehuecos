import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const { cart_barcode, location_code, status } = await req.json()

    if (!cart_barcode || !location_code || !status) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    // Update location status
    const updateResult = await query("UPDATE locations SET size = ?, updated_at = NOW() WHERE code = ?", [
      status,
      location_code,
    ])

    // Log the movement
    await query("INSERT INTO movement_logs (cart_barcode, location_code, status, created_at) VALUES (?, ?, ?, NOW())", [
      cart_barcode,
      location_code,
      status,
    ])

    return NextResponse.json({
      success: true,
      message: "Movimiento registrado correctamente",
    })
  } catch (error) {
    console.error("Error in movement API:", error)
    return NextResponse.json({ error: "Error al registrar el movimiento" }, { status: 500 })
  }
}
