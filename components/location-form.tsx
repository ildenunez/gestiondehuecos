"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Location {
  id: string
  size: string
  status: "EMPTY" | "HALF" | "FULL"
}

interface LocationFormProps {
  editingId?: string | null
  location?: Location
  onSubmit: () => void
  onCancel: () => void
}

export function LocationForm({ editingId, location, onSubmit, onCancel }: LocationFormProps) {
  const [formData, setFormData] = useState<Partial<Location>>({
    id: "",
    size: "MEDIANO",
    status: "EMPTY",
    ...location,
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/locations/${editingId}` : "/api/locations"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSubmit()
      } else {
        alert("Error al guardar el hueco")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al guardar el hueco")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{editingId ? "Editar Hueco" : "Crear Nuevo Hueco"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">Código del Hueco</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                disabled={!!editingId}
                placeholder="Ej: U010101A1"
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tamaño</label>
              <select
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>PEQUEÑO</option>
                <option>MEDIANO</option>
                <option>GRANDE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Estado</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>EMPTY</option>
                <option>HALF</option>
                <option>FULL</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="border-border bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
