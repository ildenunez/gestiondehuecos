let pool: any = null
let usesMysql = false

async function initializePool() {
  if (typeof window !== "undefined") {
    return
  }

  try {
    const mysql = await import("mysql2/promise")
    usesMysql = true
    pool = mysql.createPool({
      host: process.env.DB_HOST || "inetwork.es",
      user: process.env.DB_USER || "ilde",
      password: process.env.DB_PASSWORD || "Ildenunez80!",
      database: process.env.DB_NAME || "huecos",
      port: Number.parseInt(process.env.DB_PORT || "3306"),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
    console.log("[v0] MySQL pool initialized")
  } catch (error) {
    console.log("[v0] MySQL not available, using mock data")
    usesMysql = false
  }
}

// Call initializePool when module loads
initializePool().catch(console.error)

// Mock data for fallback mode
const mockUsers = [{ id: 1, username: "ilde", password: "8019", name: "Ilde Núñez", role: "admin" }]

let mockLocations = [
  { id: "U010101A1", size: "PEQUEÑO", status: "EMPTY" },
  { id: "U010102A1", size: "MEDIANO", status: "HALF" },
  { id: "U010103A1", size: "GRANDE", status: "FULL" },
]

export async function query(sql: string, values?: any[]) {
  try {
    // If MySQL is available, use it
    if (usesMysql && pool) {
      const connection = await pool.getConnection()
      try {
        const [results] = await connection.execute(sql, values)
        return results
      } finally {
        connection.release()
      }
    }

    // Fallback to mock data
    if (sql.includes("SELECT * FROM users WHERE username")) {
      const username = values?.[0]
      return mockUsers.filter((u) => u.username === username)
    }

    if (sql.includes("SELECT") && sql.includes("locations")) {
      return mockLocations
    }

    if (sql.includes("INSERT INTO locations")) {
      const [id, size, status] = values || []
      const newLocation = {
        id,
        size,
        status,
      }
      mockLocations.push(newLocation)
      return { insertId: id }
    }

    if (sql.includes("UPDATE locations")) {
      const [size, status, id] = values || []
      const index = mockLocations.findIndex((l) => l.id === id)
      if (index !== -1) {
        mockLocations[index] = { id, size, status }
      }
      return { affectedRows: 1 }
    }

    if (sql.includes("DELETE FROM locations")) {
      const id = values?.[0]
      mockLocations = mockLocations.filter((l) => l.id !== id)
      return { affectedRows: 1 }
    }

    return []
  } catch (error) {
    console.error("[v0] Database query error:", error)
    throw error
  }
}

export async function getLocations() {
  const results = await query("SELECT * FROM locations ORDER BY id DESC")
  return results
}

export async function getLocationById(id: string) {
  const results = await query("SELECT * FROM locations WHERE id = ?", [id])
  return results[0] || null
}

export async function createLocation(data: { id: string; size: string; status: string }) {
  const result = await query("INSERT INTO locations (id, size, status) VALUES (?, ?, ?)", [
    data.id,
    data.size,
    data.status,
  ])
  return result
}

export async function updateLocation(id: string, data: any) {
  const result = await query("UPDATE locations SET size = ?, status = ? WHERE id = ?", [data.size, data.status, id])
  return result
}

export async function deleteLocation(id: string) {
  const result = await query("DELETE FROM locations WHERE id = ?", [id])
  return result
}
