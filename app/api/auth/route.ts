import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const supabase = await createClient()

    if (body?.action === 'signOut') {
      await supabase.auth.signOut()
      return NextResponse.json({ success: true })
    }

    if (body?.access_token) {
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: body.access_token,
        refresh_token: body.refresh_token,
      })

      if (sessionError) {
        return NextResponse.json({ error: sessionError.message }, { status: 401 })
      }

      if (!sessionData?.session) {
        return NextResponse.json({ error: 'Unable to sync auth session' }, { status: 401 })
      }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user profile exists, create if not
    const existingProfile = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!existingProfile) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in auth callback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}