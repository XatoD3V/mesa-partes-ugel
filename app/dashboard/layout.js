import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import Sidebar from "@/components/Sidebar";
import NotificacionesBell from "@/components/NotificacionesBell";

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
    <div className="flex min-h-screen bg-papel">
      <Sidebar perfil={perfil} />
      <div className="flex-1">
        <header className="flex h-16 items-center justify-end gap-3 border-b border-tinta-900/10 bg-papel-100 px-6">
          <NotificacionesBell userId={user.id} />
        </header>
        <main className="p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
