'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
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
  signIn: (email: string, password: string) => Promise<{ error: string | null; session: Session | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; session: Session | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initialize singleton client for browser environment
const supabaseClient = typeof window !== 'undefined' ? createClient() : null

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const syncServerSession = useCallback(async (session?: Session | null) => {
    const client = supabaseClient || (typeof window !== 'undefined' ? createClient() : null)
    if (!client) return

    const currentSession = session ?? (await client.auth.getSession()).data.session
    if (!currentSession?.access_token) return

    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: currentSession.access_token,
        refresh_token: currentSession.refresh_token,
      }),
    }).catch(() => {})
  }, [])

  const fetchProfile = useCallback(async (userId: string) => {
    const client = supabaseClient || (typeof window !== 'undefined' ? createClient() : null)
    if (!client) return

    try {
      const { data } = await client
        .from('users')
        .select('id, email, name, phone, address, role, points, tier')
        .eq('id', userId)
        .single()

      if (data) {
        setProfile(data as UserProfile)
      }
    } catch {
      try {
        const { data: { session } } = await client.auth.getSession()
        if (session?.access_token) {
          await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
          }).catch(() => {})
        }

        const { data: retryData } = await client
          .from('users')
          .select('id, email, name, phone, address, role, points, tier')
          .eq('id', userId)
          .single()
        if (retryData) {
          setProfile(retryData as UserProfile)
        }
      } catch {
        // Silent fail
      }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    const client = supabaseClient || (typeof window !== 'undefined' ? createClient() : null)
    if (!client) {
      setLoading(false)
      return
    }

    let mounted = true
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 5000)

    const { data: { subscription } } = client.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return
        clearTimeout(timeout)

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await syncServerSession(session)
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [fetchProfile, syncServerSession])

  const signIn = async (email: string, password: string) => {
    const client = supabaseClient || (typeof window !== 'undefined' ? createClient() : null)
    if (!client) return { error: 'Auth not configured', session: null }

    const { data, error } = await client.auth.signInWithPassword({ email, password })
    await syncServerSession(data.session ?? null)

    return { error: error?.message ?? null, session: data.session ?? null }
  }

  const signUp = async (email: string, password: string, name: string) => {
    const client = supabaseClient || (typeof window !== 'undefined' ? createClient() : null)
    if (!client) return { error: 'Auth not configured', session: null }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    await syncServerSession(data.session ?? null)

    return { error: error?.message ?? null, session: data.session ?? null }
  }

  const signOut = async () => {
    const client = supabaseClient || (typeof window !== 'undefined' ? createClient() : null)
    if (!client) {
      setUser(null)
      setProfile(null)
      return
    }
    await client.auth.signOut()
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'signOut' }),
    }).catch(() => {})
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