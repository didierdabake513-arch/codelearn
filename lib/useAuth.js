import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    try {
      const r = await fetch('/api/auth/me')
      if (r.ok) { const d = await r.json(); setUser(d.user) }
      else setUser(null)
    } catch { setUser(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (email, password) => {
    const r = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Erreur connexion')
    setUser(d.user)
    return d.user
  }

  const register = async (email, password, name) => {
    const r = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Erreur inscription')
    setUser(d.user)
    return d.user
  }

  const logout = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
