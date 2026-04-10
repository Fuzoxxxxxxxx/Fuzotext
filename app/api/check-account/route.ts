import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  // Use service role to check if any users exist
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { count } = await supabase
    .from('texts')
    .select('*', { count: 'exact', head: true })

  // If there are any texts, it means the owner has already set up their account
  // We also check if there's an active session in the auth.users table
  const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1 })
  
  const exists = (users?.users?.length || 0) > 0

  return NextResponse.json({ exists })
}
