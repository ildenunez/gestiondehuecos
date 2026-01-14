"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit2, Trash2, Plus } from "lucide-react"
import { LocationForm } from "./location-form"

interface Location {
  id: string
  size: string
  status: "EMPTY" | "HALF" | "FULL"
}

export function LocationsTable() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    try {
      setLoading(true)
      const res = await fetch("/api/locations")
      const data = await res.json()
      setLocations(data)
    } catch (error) {
      console.error("Error fetching locations:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (confirm("¿Estás seguro de que deseas eliminar este hueco?")) {
      try {
        await fetch(`/api/locations/${id}`, { method: "DELETE" })
        setLocations(locations.filter((l) => l.id !== id))
      } catch (error) {
        console.error("Error deleting location:", error)
      }
    }
  }

  const filteredLocations = locations.filter((loc) => String(loc.id).toLowerCase().includes(filter.toLowerCase()))

  const statusColors = {
    EMPTY: "bg-blue-500/20 text-blue-400",
    HALF: "bg-yellow-500/20 text-yellow-400",
    FULL: "bg-red-500/20 text-red-400",
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Gestión de Huecos</h2>
        <Button
          onClick={() => {
            setEditingId(null)
            setShowForm(true)
          }}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Nuevo Hueco
        </Button>
      </div>

      {showForm && (
        <LocationForm
          editingId={editingId}
          location={editingId ? locations.find((l) => l.id === editingId) : undefined}
          onSubmit={() => {
            setShowForm(false)
            fetchLocations()
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar por código del hueco..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading ? (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">Cargando huecos...</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Lista de Huecos ({filteredLocations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Código</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Tamaño</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Estado</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLocations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-muted-foreground">
                        No se encontraron huecos
                      </td>
                    </tr>
                  ) : (
                    filteredLocations.map((location) => (
                      <tr key={location.id} className="border-b border-border hover:bg-secondary/50 transition">
                        <td className="py-3 px-4 font-mono text-foreground">{location.id}</td>
                        <td className="py-3 px-4 text-foreground">{location.size}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[location.status]}`}
                          >
                            {location.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingId(location.id)
                                setShowForm(true)
                              }}
                              className="p-1.5 hover:bg-primary/20 rounded text-accent hover:text-accent transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(location.id)}
                              className="p-1.5 hover:bg-destructive/20 rounded text-destructive hover:text-destructive transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
