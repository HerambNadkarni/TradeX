import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://qbwcmjcbutwasgsxfgjr.supabase.co"
const supabaseKey = "sb_publishable_L0opY39blyQnnSW-pkHvng_cvRzv0Tn"

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)