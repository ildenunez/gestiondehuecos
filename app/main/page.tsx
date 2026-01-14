"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { StatusSelector } from "@/components/status-selector"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LogOut, Loader2 } from "lucide-react"
import { logout, isAuthenticated } from "@/lib/auth"
import { useEffect } from "react"

export default function MainPage() {
  const router = useRouter()
  const [cartBarcode, setCartBarcode] = useState("")
  const [locationCode, setLocationCode] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  const handleSubmit = async () => {
    if (!cartBarcode || !locationCode || !status) {
      setMessage("Por favor completa todos los campos")
      setMessageType("error")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/movement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart_barcode: cartBarcode,
          location_code: locationCode,
          status: status,
        }),
      })

      if (response.ok) {
        setMessage("Movimiento registrado correctamente")
        setMessageType("success")
        setCartBarcode("")
        setLocationCode("")
        setStatus(null)
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage("Error al registrar el movimiento")
        setMessageType("error")
      }
    } catch (error) {
      setMessage("Error de conexión")
      setMessageType("error")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-10">
        <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Gestor de Almacén</h1>
          <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Message Alert */}
        {message && (
          <Card
            className={`p-4 text-center font-semibold ${
              messageType === "success"
                ? "bg-green-100 text-green-900 border-green-300"
                : "bg-red-100 text-red-900 border-red-300"
            }`}
          >
            {message}
          </Card>
        )}

        {/* Scanners */}
        <BarcodeScanner onScan={setCartBarcode} label="Código del Carro" placeholder="Ingresa el código del carro" />

        <BarcodeScanner onScan={setLocationCode} label="Código del Hueco" placeholder="Ingresa el código del hueco" />

        {/* Status Selector */}
        <StatusSelector selected={status} onSelect={setStatus} />

        {/* Display Selected Values */}
        {(cartBarcode || locationCode || status) && (
          <Card className="p-4 bg-secondary">
            <div className="space-y-2 text-sm">
              {cartBarcode && (
                <p>
                  Carro: <span className="font-semibold">{cartBarcode}</span>
                </p>
              )}
              {locationCode && (
                <p>
                  Hueco: <span className="font-semibold">{locationCode}</span>
                </p>
              )}
              {status && (
                <p>
                  Estado:{" "}
                  <span className="font-semibold">
                    {status === "EMPTY" ? "Vacío" : status === "HALF" ? "50% Lleno" : "Completo"}
                  </span>
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!cartBarcode || !locationCode || !status || loading}
          className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Registrando...
            </>
          ) : (
            "Registrar Movimiento"
          )}
        </Button>
      </div>
    </main>
  )
}
