"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LocationsTable } from "@/components/locations-table"
import { Warehouse, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUser, logout, isAuthenticated } from "@/lib/auth"

export default function DashboardPage() {
  const router = useRouter()
  const user = getUser()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Warehouse className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Gestor de Almacén</h1>
              <p className="text-muted-foreground mt-1">Bienvenido, {user.name}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 border-border hover:bg-secondary bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LocationsTable />
      </div>
    </main>
  )
}
