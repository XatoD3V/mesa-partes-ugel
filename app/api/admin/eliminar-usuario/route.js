import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    const supabase = supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
    if (!perfil || perfil.rol !== "admin") {
      return NextResponse.json({ error: "Solo un administrador puede eliminar usuarios." }, { status: 403 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Falta el ID del usuario." }, { status: 400 });
    }
    if (id === user.id) {
      return NextResponse.json({ error: "No puedes eliminar tu propia cuenta de administrador." }, { status: 400 });
    }

    const admin = supabaseAdmin();

    // Elimina la cuenta de autenticación; la fila en "perfiles" se borra sola
    // por la referencia "on delete cascade" hacia auth.users.
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Error inesperado." }, { status: 500 });
  }
}
