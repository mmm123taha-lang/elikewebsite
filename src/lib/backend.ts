import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const backend = url && key ? createClient(url, key) : null
export const checkoutEnabled = import.meta.env.VITE_CHECKOUT_ENABLED === 'true'
