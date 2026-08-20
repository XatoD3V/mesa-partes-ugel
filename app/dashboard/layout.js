import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({ children }) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*, oficina:oficina_id(id, nombre, codigo)")
    .eq("id", user.id)
    .single();

  if (!perfil) redirect("/login");

  const { data: config } = await supabase
    .from("configuracion_sitio")
    .select("favicon_url")
    .eq("id", 1)
    .single();

  return (
    <DashboardShell perfil={perfil} userId={user.id} logoUrl={config?.favicon_url || null}>
      {children}
    </DashboardShell>
  );
}
