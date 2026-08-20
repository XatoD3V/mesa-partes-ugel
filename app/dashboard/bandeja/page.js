import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import BandejaCliente from "@/components/BandejaCliente";

export default async function BandejaPage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", user.id).single();

  if (!perfil || perfil.rol === "externo") redirect("/dashboard");

  return <BandejaCliente perfil={perfil} />;
}
