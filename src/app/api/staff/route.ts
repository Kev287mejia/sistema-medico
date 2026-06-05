import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase/service'

export async function POST(req: Request) {
  try {
    const { email, password, full_name, role, license_number } = await req.json()

    if (!email || !password || !full_name || !role) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const supabaseAdmin = getServiceSupabase()

    // 1. Create User in Auth module
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Error desconocido al crear usuario' }, { status: 500 })
    }

    // 2. Insert into profiles table
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: authData.user.id,
      email: email,
      full_name: full_name,
      role: role,
      license_number: license_number || null,
      is_active: true
    })

    if (profileError) {
      // Rollback auth user creation if profile fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: authData.user })

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
