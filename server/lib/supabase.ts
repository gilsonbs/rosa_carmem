import { createClient } from '@supabase/supabase-js'
import { WebSocket } from 'ws'

// Node 20 não tem WebSocket nativo; supabase-js realtime precisa dele
if (!('WebSocket' in globalThis)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).WebSocket = WebSocket
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing Supabase server env vars. Check VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.',
  )
}

// Cliente server-side com a service role key: ignora RLS, nunca deve ser
// exposto ao frontend.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
