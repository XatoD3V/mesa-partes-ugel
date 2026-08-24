import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/server/auth";

const ROLES = ["externo", "mesa_partes", "jefe_oficina", "admin"];

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.response) return NextResponse.json({ error: auth.response.error }, { status: auth.response.status });

    const body = await request.json();
    const { email, password, nombres, apellidos, rol, oficina_id, numero_documento, telefono } = body || {};
    if (!email || !password || !nombres || !apellidos || !rol) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }
    if (typeof email !== "string" || email.length > 254 || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Correo electrónico inválido." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return NextResponse.json({ error: "La contraseña debe tener entre 8 y 128 caracteres." }, { status: 400 });
    }
    if (!ROLES.includes(rol)) return NextResponse.json({ error: "Rol inválido." }, { status: 400 });

    const admin = supabaseAdmin();
    if (rol !== "externo" && !oficina_id) {
      return NextResponse.json({ error: "Debe seleccionar una oficina para este rol." }, { status: 400 });
    }

    const { data: nuevo, error: createError } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(), password, email_confirm: true,
      user_metadata: { nombres, apellidos, numero_documento: numero_documento || null, telefono: telefono || null, tipo_documento: "DNI" },
    });
    if (createError) return NextResponse.json({ error: "No se pudo crear el usuario." }, { status: 400 });

    const { error: updateError } = await admin.from("perfiles").update({
      nombres, apellidos, rol, oficina_id: rol === "externo" ? null : oficina_id,
      numero_documento: numero_documento || null, telefono: telefono || null,
    }).eq("id", nuevo.user.id);

    if (updateError) {
      await admin.auth.admin.deleteUser(nuevo.user.id);
      return NextResponse.json({ error: "No se pudo completar el perfil del usuario." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, id: nuevo.user.id });
  } catch {
    return NextResponse.json({ error: "Error inesperado." }, { status: 500 });
  }
}
