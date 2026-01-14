export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("auth_token")
}

export function getUser() {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

export function logout() {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user")
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}
