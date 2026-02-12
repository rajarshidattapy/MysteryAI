import { createClient } from '@supabase/supabase-js'

// Read from Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create Supabase client if both env vars are present
// This makes Supabase optional (used only for RAG/embeddings)
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase client initialized (optional RAG features enabled)')
} else {
  console.warn('⚠️ Supabase env vars not set - RAG/embeddings features disabled (app will work without them)')
}

export { supabase }
export default supabase
