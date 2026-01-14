"use client"

import { Button } from "@/components/ui/button"

interface StatusSelectorProps {
  selected: string | null
  onSelect: (status: string) => void
}

export function StatusSelector({ selected, onSelect }: StatusSelectorProps) {
  const statuses = [
    { id: "EMPTY", label: "Vacío", color: "bg-blue-500" },
    { id: "HALF", label: "50% Lleno", color: "bg-yellow-500" },
    { id: "FULL", label: "Completo", color: "bg-red-500" },
  ]

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">Estado del Hueco</label>
      <div className="grid grid-cols-3 gap-2">
        {statuses.map((status) => (
          <Button
            key={status.id}
            onClick={() => onSelect(status.id)}
            className={`h-16 text-xs font-bold ${
              selected === status.id ? `${status.color} ring-2 ring-offset-1` : `${status.color} opacity-60`
            }`}
          >
            {status.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
