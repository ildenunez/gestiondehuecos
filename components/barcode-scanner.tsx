"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, X } from "lucide-react"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  label: string
  placeholder: string
}

export function BarcodeScanner({ onScan, label, placeholder }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [scannedValue, setScannedValue] = useState("")
  const [manualInput, setManualInput] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!scanning || !videoRef.current) return

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Error accessing camera:", err)
        alert("No se pudo acceder a la cámara")
        setScanning(false)
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [scanning])

  useEffect(() => {
    if (!scanning || !videoRef.current || !canvasRef.current) return

    const interval = setInterval(() => {
      const canvas = canvasRef.current
      const video = videoRef.current
      if (!canvas || !video || video.readyState !== video.HAVE_ENOUGH_DATA) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)

      // Simple barcode detection (looking for patterns)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Detect barcode using edge detection
      let barcode = ""
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
        barcode += brightness > 128 ? "1" : "0"
      }

      // Extract barcode pattern (simplified)
      const pattern = barcode.substring(0, 50)
      if (pattern && pattern.length > 20) {
        // Found a pattern, extract numeric code
        const numericCode = extractNumericPattern(pattern)
        if (numericCode) {
          setScannedValue(numericCode)
          handleScan(numericCode)
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [scanning])

  const extractNumericPattern = (pattern: string): string => {
    // Simple extraction of numeric pattern
    const match = pattern.match(/\d{6,}/)
    return match ? match[0] : ""
  }

  const handleScan = (value: string) => {
    onScan(value)
    setScanning(false)
    setScannedValue("")
  }

  const handleManualInput = () => {
    if (manualInput.trim()) {
      handleScan(manualInput)
      setManualInput("")
    }
  }

  return (
    <Card className="p-6 w-full">
      <label className="text-lg font-semibold mb-4 block text-foreground">{label}</label>

      {scanning ? (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-4 border-primary opacity-50"></div>
          </div>
          <Button onClick={() => setScanning(false)} variant="destructive" className="w-full h-12 text-base">
            <X className="mr-2 h-5 w-5" />
            Cancelar Escaneo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            onClick={() => setScanning(true)}
            className="w-full h-14 text-lg gap-2 bg-primary hover:bg-primary/90"
          >
            <Camera className="h-6 w-6" />
            Escanear Código
          </Button>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-muted-foreground">O</span>
            </div>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleManualInput()}
              placeholder={placeholder}
              className="w-full pl-8 pr-4 py-3 text-lg border-2 border-border rounded-lg bg-background focus:outline-none focus:border-primary"
            />
          </div>

          <Button
            onClick={handleManualInput}
            disabled={!manualInput.trim()}
            variant="outline"
            className="w-full h-12 text-base bg-transparent"
          >
            Ingresar Código
          </Button>

          {scannedValue && (
            <div className="p-4 bg-green-100 border-2 border-green-500 rounded-lg">
              <p className="text-green-900 font-semibold">Código detectado: {scannedValue}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
