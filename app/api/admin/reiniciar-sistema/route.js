import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const FRASE_CONFIRMACION = "REINICIAR";

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
      return NextResponse.json({ error: "Solo un administrador puede reiniciar el sistema." }, { status: 403 });
    }

    const { confirmacion } = await request.json();
    if (confirmacion !== FRASE_CONFIRMACION) {
      return NextResponse.json({ error: `Debes escribir exactamente "${FRASE_CONFIRMACION}" para confirmar.` }, { status: 400 });
    }

    const admin = supabaseAdmin();

    // 1) Borra todos los expedientes: por las referencias "on delete cascade",
    //    esto arrastra automáticamente derivaciones, historial y notificaciones ligadas a ellos.
    const { error: errDocs } = await admin.from("documentos").delete().not("id", "is", null);
    if (errDocs) throw errDocs;

    // 2) Por si quedara alguna notificación suelta sin documento asociado
    await admin.from("notificaciones").delete().not("id", "is", null);

    // 3) Elimina todas las cuentas que no sean de administrador (personal y usuarios externos)
    const { data: perfiles } = await admin.from("perfiles").select("id, rol").neq("rol", "admin");

    let eliminados = 0;
    for (const p of perfiles || []) {
      const { error } = await admin.auth.admin.deleteUser(p.id);
      if (!error) eliminados++;
    }

    return NextResponse.json({ ok: true, usuariosEliminados: eliminados });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Error inesperado." }, { status: 500 });
  }
}
