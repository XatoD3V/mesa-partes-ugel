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

  return (
    <DashboardShell perfil={perfil} userId={user.id}>
      {children}
    </DashboardShell>
  );
}
