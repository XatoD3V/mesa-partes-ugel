import { createClient } from "@supabase/supabase-js";

// OJO: este cliente usa la "service_role key", una clave secreta con acceso total.
// Solo debe importarse desde código que corre en el servidor (Route Handlers, API routes),
// NUNCA desde un componente "use client" ni exponerse con el prefijo NEXT_PUBLIC_.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
