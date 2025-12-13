'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  loginWithUser: (userData: User) => void
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateProfile: (name: string, email: string) => Promise<boolean>
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  promoteToAdmin: (userId: string) => Promise<boolean>
  demoteFromAdmin: (userId: string) => Promise<boolean>
  isAdmin: () => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ตรวจสอบ session จาก server
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include'
        })
        
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok && data.user) {
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok && data.user) {
        setUser(data.user)
        return true
      }
      return false
    } catch (error) {
      console.error('Register error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const loginWithUser = (userData: User) => {
    setUser(userData)
  }

  const updateProfile = async (name: string, email: string): Promise<boolean> => {
    if (!user) return false

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
        credentials: 'include'
      })
      
      if (res.ok) {
        const updatedUser = { ...user, name, email }
        setUser(updatedUser)
        return true
      }
      return false
    } catch (error) {
      console.error('Update profile error:', error)
      return false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          currentPassword,
          newPassword
        }),
        credentials: 'include'
      })

      return res.ok
    } catch (error) {
      console.error('Change password error:', error)
      return false
    }
  }

  const promoteToAdmin = async (userId: string): Promise<boolean> => {
    if (!user || user.role !== 'admin') return false

    try {
      const res = await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userId }),
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok) {
        return true
      } else {
        console.error('Promote to admin error:', data.error)
        return false
      }
    } catch (error) {
      console.error('Promote to admin error:', error)
      return false
    }
  }

  const demoteFromAdmin = async (userId: string): Promise<boolean> => {
    if (!user || user.role !== 'admin') return false

    try {
      const res = await fetch('/api/admin/demote-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userId }),
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok) {
        return true
      } else {
        console.error('Demote from admin error:', data.error)
        return false
      }
    } catch (error) {
      console.error('Demote from admin error:', error)
      return false
    }
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithUser,
        register,
        logout,
        updateProfile,
        changePassword,
        promoteToAdmin,
        demoteFromAdmin,
        isAdmin,
        isLoading,
      }}
    >
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
