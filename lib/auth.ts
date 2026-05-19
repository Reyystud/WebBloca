import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import type { User } from '@supabase/supabase-js'

export async function getAuthUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getAuthUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (profile?.role !== 'ADMIN') {
    throw new Error('Forbidden')
  }

  return user
}