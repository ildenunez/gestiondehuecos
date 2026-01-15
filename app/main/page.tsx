"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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

  const [scanningCart, setScanningCart] = useState(false)
  const [scanningLocation, setScanningLocation] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  const startCamera = async (type: "cart" | "location") => {
    console.log("[v0] Starting camera for:", type)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      console.log("[v0] Got media stream:", stream)
      console.log("[v0] Video tracks:", stream.getVideoTracks())

      if (videoRef.current) {
        console.log("[v0] Setting srcObject to video element")
        videoRef.current.srcObject = stream
        streamRef.current = stream

        if (type === "cart") {
          setScanningCart(true)
        } else {
          setScanningLocation(true)
        }

        // Wait for video to be ready and then play
        videoRef.current.onloadedmetadata = async () => {
          console.log("[v0] Video metadata loaded, attempting to play")
          try {
            await videoRef.current?.play()
            console.log("[v0] Video playing successfully")
          } catch (playError) {
            console.error("[v0] Video play error:", playError)
            setMessage("Error al reproducir video")
            setMessageType("error")
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error accessing camera:", error)
      setMessage("No se pudo acceder a la cámara: " + (error as Error).message)
      setMessageType("error")
    }
  }

  const stopCamera = () => {
    console.log("[v0] Stopping camera")
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        console.log("[v0] Stopping track:", track.label)
        track.stop()
      })
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanningCart(false)
    setScanningLocation(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

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
        setMessage("Registrado correctamente")
        setMessageType("success")
        setCartBarcode("")
        setLocationCode("")
        setStatus(null)
        setTimeout(() => setMessage(""), 2500)
      } else {
        setMessage("Error al registrar")
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

  if (scanningCart || scanningLocation) {
    return (
      <main className="h-screen bg-black flex flex-col">
        <div className="bg-card border-b border-border px-3 py-2">
          <h2 className="text-lg font-bold text-center text-foreground">
            {scanningCart ? "Escanear Carro" : "Escanear Hueco"}
          </h2>
        </div>

        <div className="flex-1 relative bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ display: "block" }}
          />
          {/* Guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-4 border-primary w-64 h-32 rounded-lg"></div>
          </div>
          {/* Debug info */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
            <p>Cámara: {streamRef.current ? "Activa" : "Inactiva"}</p>
            <p>Video: {videoRef.current?.srcObject ? "Conectado" : "Desconectado"}</p>
          </div>
        </div>

        <div className="p-3 space-y-2 bg-card">
          <input
            type="text"
            value={scanningCart ? cartBarcode : locationCode}
            onChange={(e) => (scanningCart ? setCartBarcode(e.target.value) : setLocationCode(e.target.value))}
            placeholder="O escribe el código manualmente"
            className="w-full px-3 py-3 text-base border border-border rounded bg-background"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={stopCamera} variant="destructive" className="h-12">
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if ((scanningCart && cartBarcode) || (scanningLocation && locationCode)) {
                  stopCamera()
                }
              }}
              disabled={scanningCart ? !cartBarcode : !locationCode}
              className="h-12 bg-primary"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <div className="bg-card border-b border-border px-3 py-2 flex justify-between items-center flex-shrink-0">
        <h1 className="text-lg font-bold text-primary">Almacén</h1>
        <Button onClick={handleLogout} variant="outline" size="sm" className="gap-1 h-8 text-xs bg-transparent">
          <LogOut className="h-3 w-3" />
          Salir
        </Button>
      </div>

      {message && (
        <div
          className={`px-3 py-1 text-center text-sm font-semibold flex-shrink-0 ${
            messageType === "success" ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
          }`}
        >
          {message}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        <div>
          <label className="text-xs font-semibold block mb-1">Carro</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={cartBarcode}
              onChange={(e) => setCartBarcode(e.target.value)}
              placeholder="Código carro"
              className="flex-1 px-2 py-2 text-sm border border-border rounded bg-background"
            />
            <Button onClick={() => startCamera("cart")} size="sm" className="h-9 px-2 bg-primary">
              📷
            </Button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1">Hueco</label>
          <div className="flex gap-1">
            <input
              type="text"
              value={locationCode}
              onChange={(e) => setLocationCode(e.target.value)}
              placeholder="Código hueco"
              className="flex-1 px-2 py-2 text-sm border border-border rounded bg-background"
            />
            <Button onClick={() => startCamera("location")} size="sm" className="h-9 px-2 bg-primary">
              📷
            </Button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold block mb-1">Estado</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "EMPTY", label: "Vacío", color: "bg-blue-500" },
              { id: "HALF", label: "50%", color: "bg-yellow-500" },
              { id: "FULL", label: "Lleno", color: "bg-red-500" },
            ].map((s) => (
              <Button
                key={s.id}
                onClick={() => setStatus(s.id)}
                className={`h-12 text-xs font-bold ${
                  status === s.id ? `${s.color} ring-2 ring-offset-1` : `${s.color} opacity-60`
                }`}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        {(cartBarcode || locationCode || status) && (
          <div className="text-xs bg-secondary p-2 rounded border border-border">
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
                  {status === "EMPTY" ? "Vacío" : status === "HALF" ? "50%" : "Lleno"}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="px-3 py-2 flex-shrink-0 border-t border-border bg-card">
        <Button
          onClick={handleSubmit}
          disabled={!cartBarcode || !locationCode || !status || loading}
          className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando...
            </>
          ) : (
            "Registrar"
          )}
        </Button>
      </div>
    </main>
  )
}
