'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

interface AuthContextType {
  token: string | null
  user: any | null
  loading: boolean
  signup: (email: string, username: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://127.0.0.1:8000/api'


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = Cookies.get('token')
    if (savedToken) {
      setToken(savedToken)
      fetchUser(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setUser(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      Cookies.remove('token')
      setToken(null)
      setLoading(false)
    }
  }

  const signup = async (email: string, username: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        username,
        password,
      })
      setUser(response.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Signup failed')
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/token`,
        new URLSearchParams({
          username: email,
          password: password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )
      const newToken = response.data.access_token
      Cookies.set('token', newToken, { expires: 7 })
      setToken(newToken)
      await fetchUser(newToken)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed')
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
