import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/server/auth";

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return NextResponse.json({ error: auth.response.error }, { status: auth.response.status });
    const { id } = await request.json();
    if (!id || typeof id !== "string") return NextResponse.json({ error: "Falta el ID del usuario." }, { status: 400 });
    if (id === auth.user.id) return NextResponse.json({ error: "No puedes eliminar tu propia cuenta de administrador." }, { status: 400 });

    const admin = supabaseAdmin();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return NextResponse.json({ error: "No se pudo eliminar el usuario." }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error inesperado." }, { status: 500 });
  }
}
