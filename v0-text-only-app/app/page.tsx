import { createClient } from '@/lib/supabase/server'
import { PublicView } from '@/components/public-view'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: texts } = await supabase
    .from('texts')
    .select('*')
    .order('created_at', { ascending: false })

  return <PublicView initialTexts={texts || []} />
}
