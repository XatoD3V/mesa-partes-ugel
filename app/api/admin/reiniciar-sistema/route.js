import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/server/auth";

const FRASE_CONFIRMACION = "REINICIAR";

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return NextResponse.json({ error: auth.response.error }, { status: auth.response.status });
    const { confirmacion } = await request.json();
    if (confirmacion !== FRASE_CONFIRMACION) return NextResponse.json({ error: `Debes escribir exactamente "${FRASE_CONFIRMACION}" para confirmar.` }, { status: 400 });

    const admin = supabaseAdmin();
    const { error: errDocs } = await admin.from("documentos").delete().not("id", "is", null);
    if (errDocs) throw errDocs;
    const { error: errNotif } = await admin.from("notificaciones").delete().not("id", "is", null);
    if (errNotif) throw errNotif;

    const { data: perfiles, error: perfilesError } = await admin.from("perfiles").select("id, rol").neq("rol", "admin");
    if (perfilesError) throw perfilesError;
    let eliminados = 0;
    for (const p of perfiles || []) {
      const { error } = await admin.auth.admin.deleteUser(p.id);
      if (!error) eliminados++;
    }
    return NextResponse.json({ ok: true, usuariosEliminados: eliminados });
  } catch {
    return NextResponse.json({ error: "No se pudo completar el reinicio del sistema." }, { status: 500 });
  }
}
