import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  user: { name: string; email: string; avatar: string } | null
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null)

  const login = (email: string) => {
    setIsAuthenticated(true)
    setUser({
      name: 'João Consultor',
      email: email,
      avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1',
    })
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
