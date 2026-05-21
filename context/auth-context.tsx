'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  email: string
  name: string | null
  phone: string | null
  address: string | null
  role: 'USER' | 'ADMIN'
  points: number
  tier: 'SILVER' | 'GOLD' | 'PLATINUM'
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    try {
      setSupabase(createClient())
    } catch {
      console.error('Failed to initialize Supabase client. Check your environment variables.')
      setLoading(false)
    }
  }, [])

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    try {
      const { data } = await supabase
        .from('users')
        .select('id, email, name, phone, address, role, points, tier')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data as UserProfile)
      }
    } catch {
      try {
        await fetch('/api/auth', { method: 'POST' })
        const { data: retryData } = await supabase
          .from('users')
          .select('id, email, name, phone, address, role, points, tier')
          .eq('id', userId)
          .single()
        if (retryData) {
          setProfile(retryData as UserProfile)
        }
      } catch {
      }
    }
  }, [supabase])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    if (!supabase) return

    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        clearTimeout(timeout)

        const currentUser = session?.user ?? null
        setUser(currentUser)
        setLoading(false)

        if (currentUser) {
          fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Auth not configured' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    if (!supabase) return { error: 'Auth not configured' }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    if (!supabase) {
      setUser(null)
      setProfile(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}
    >
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