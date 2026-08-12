import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function initSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Zing] Supabase credentials missing — checkout will be unavailable until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env')
    return null
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = initSupabase()
