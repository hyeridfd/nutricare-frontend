import { createContext, useContext, useState, ReactNode } from "react"

interface AuthState {
  token: string | null
  facilityId: string | null
  facilityName: string | null
}

interface AuthContextValue extends AuthState {
  login: (token: string, facilityId: string, facilityName: string) => void
  logout: () => void
}

const STORAGE_KEY = "nutricare_auth"

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStored(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, facilityId: null, facilityName: null }
    return JSON.parse(raw)
  } catch {
    return { token: null, facilityId: null, facilityName: null }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadStored)

  const login = (token: string, facilityId: string, facilityName: string) => {
    const next = { token, facilityId, facilityName }
    setState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const logout = () => {
    setState({ token: null, facilityId: null, facilityName: null })
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
