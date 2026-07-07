import { createClient } from '@supabase/supabase-js'

// Llaves inyectadas directamente (limpias y sin el /rest/v1/)
const supabaseUrl = 'https://vbudazfpfywcwxgqupaf.supabase.co'
const supabaseKey = 'sb_publishable_qH-uswjJKgwXCyAOV7J06Q_P8QVhCH6'

// Puente de conexión definitivo
export const supabase = createClient(supabaseUrl, supabaseKey)
