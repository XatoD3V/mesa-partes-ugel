import { supabaseServer } from "@/lib/supabaseServer";

export async function getAuthenticatedContext() {
  const supabase = supabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { supabase, user: null, perfil: null };

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("id, rol, oficina_id, activo")
    .eq("id", user.id)
    .single();

  if (perfil?.activo === false) return { supabase, user, perfil: null };
  return { supabase, user, perfil };
}

export async function requireAdmin() {
  const context = await getAuthenticatedContext();
  if (!context.user) return { ...context, response: { status: 401, error: "No autenticado." } };
  if (context.perfil?.rol !== "admin") {
    return { ...context, response: { status: 403, error: "No autorizado." } };
  }
  return { ...context, response: null };
}

export function jsonError(message, status) {
  return Response.json({ error: message }, { status });
}
