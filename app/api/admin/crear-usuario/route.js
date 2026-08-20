import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  try {
    // 1) Verifica que quien llama esté autenticado y sea admin (revisado en el servidor, no confiando en el cliente)
    const supabase = supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();

    if (!perfil || perfil.rol !== "admin") {
      return NextResponse.json({ error: "Solo un administrador puede crear usuarios." }, { status: 403 });
    }

    // 2) Datos del nuevo usuario
    const body = await request.json();
    const { email, password, nombres, apellidos, rol, oficina_id, numero_documento, telefono } = body;

    if (!email || !password || !nombres || !apellidos || !rol) {
      return NextResponse.json({ error: "Faltan datos obligatorios." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
    }
    if (!["externo", "mesa_partes", "jefe_oficina", "admin"].includes(rol)) {
      return NextResponse.json({ error: "Rol inválido." }, { status: 400 });
    }

    const admin = supabaseAdmin();

    // 3) Crea la cuenta de autenticación, ya con el correo confirmado (no necesita revisar su bandeja)
    const { data: nuevo, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombres,
        apellidos,
        numero_documento: numero_documento || null,
        telefono: telefono || null,
        tipo_documento: "DNI",
      },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 4) El trigger de la base de datos ya creó una fila básica en "perfiles" (rol externo por defecto);
    //    aquí la completamos con el rol y la oficina que le corresponden.
    const { error: updateError } = await admin
      .from("perfiles")
      .update({
        nombres,
        apellidos,
        rol,
        oficina_id: rol === "externo" ? null : oficina_id || null,
        numero_documento: numero_documento || null,
        telefono: telefono || null,
      })
      .eq("id", nuevo.user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, id: nuevo.user.id });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Error inesperado." }, { status: 500 });
  }
}
