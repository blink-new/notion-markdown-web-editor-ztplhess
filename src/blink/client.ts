import { createClient } from '@blinkdotnew/sdk'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const blink = createClient({
  projectId: 'notion-markdown-web-editor-ztplhess',
  authRequired: true
})

// Supabase client for database operations
export const supabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)