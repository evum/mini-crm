import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

// Client configuration accepts only a public key, never a secret/service_role key.
export const supabase = url && /^https?:\/\//.test(url) && key?.startsWith('sb_publishable_')
  ? createClient(url, key)
  : null
