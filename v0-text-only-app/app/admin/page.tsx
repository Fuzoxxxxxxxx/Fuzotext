import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminPanel } from '@/components/admin-panel'

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: texts } = await supabase
    .from('texts')
    .select('*')
    .order('created_at', { ascending: false })

  return <AdminPanel initialTexts={texts || []} userEmail={user.email || ''} />
}
