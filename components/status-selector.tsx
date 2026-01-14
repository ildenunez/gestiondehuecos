"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

interface StatusSelectorProps {
  selected: string | null
  onSelect: (status: string) => void
}

export function StatusSelector({ selected, onSelect }: StatusSelectorProps) {
  const statuses = [
    { id: "EMPTY", label: "Vacío", color: "bg-blue-500 hover:bg-blue-600" },
    { id: "HALF", label: "50% Lleno", color: "bg-yellow-500 hover:bg-yellow-600" },
    { id: "FULL", label: "Completo", color: "bg-red-500 hover:bg-red-600" },
  ]

  return (
    <Card className="p-6 w-full">
      <label className="text-lg font-semibold mb-6 block text-foreground">Estado del Hueco</label>
      <div className="grid grid-cols-3 gap-3">
        {statuses.map((status) => (
          <Button
            key={status.id}
            onClick={() => onSelect(status.id)}
            className={`h-20 flex flex-col items-center justify-center gap-2 text-white font-semibold text-base rounded-lg transition-all ${
              selected === status.id ? "ring-4 ring-offset-2 ring-primary scale-105" : ""
            } ${status.color}`}
          >
            {selected === status.id && <CheckCircle className="h-6 w-6" />}
            <span className="text-center">{status.label}</span>
          </Button>
        ))}
      </div>
    </Card>
  )
}
