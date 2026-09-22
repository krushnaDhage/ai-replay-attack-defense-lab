import { createContext, useContext, useState, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })

  const login = useCallback(async (username, password) => {
    const res = await authAPI.login({ username, password })
    const { token, ...userData } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return res.data
  }, [])

  const register = useCallback(async (username, email, password) => {
    const res = await authAPI.register({ username, email, password })
    const { token, ...userData } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return res.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
