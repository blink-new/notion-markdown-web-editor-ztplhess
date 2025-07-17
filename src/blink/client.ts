import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Supabase client configuration
const supabaseUrl = 'https://fjpiloatjlkcnflgjxza.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqcGlsb2F0amxrY25mbGdqeHphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3Mzc2NDcsImV4cCI6MjA2ODMxMzY0N30.TNe6Lv3KrfWeITK992A9OAGdzetWKwtIuW_txBYbAKM'

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)