"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  label: string
  placeholder: string
}

export function BarcodeScanner({ onScan, label, placeholder }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [input, setInput] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleManualInput = () => {
    if (input.trim()) {
      onScan(input)
      setInput("")
      setScanning(false)
    }
  }

  return (
    <Card className="p-6 w-full">
      <label className="text-lg font-semibold mb-4 block text-foreground">{label}</label>

      {scanning ? (
        <div className="space-y-4">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded bg-black h-48" />
          <Button onClick={() => setScanning(false)} variant="destructive" className="w-full">
            Cancelar
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleManualInput()}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-border rounded bg-background"
          />
          <Button onClick={() => setScanning(true)} size="sm" className="px-3">
            📷
          </Button>
        </div>
      )}
    </Card>
  )
}
