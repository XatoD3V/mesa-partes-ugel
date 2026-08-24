import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { enviarCorreoBrevo } from "@/lib/brevo";

const TIPOS_PERSONAL = new Set(["recibido", "derivado", "estado"]);

export async function POST(request) {
  try {
    const { user, perfil } = await getAuthenticatedContext();
    if (!user || !perfil) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    if (!TIPOS_PERSONAL.has((await request.clone().json())?.tipo)) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
    if (!["admin", "mesa_partes", "jefe_oficina"].includes(perfil.rol)) return NextResponse.json({ error: "No autorizado." }, { status: 403 });

    const { documento_id, tipo, estado } = await request.json();
    if (!documento_id || !tipo) return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
    const admin = supabaseAdmin();
    const { data: documento } = await admin.from("documentos").select("codigo_expediente, asunto, oficina_actual_id, usuario_emisor_id, estado").eq("id", documento_id).single();
    if (!documento) return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });

    const tieneAcceso = perfil.rol === "admin" || perfil.rol === "mesa_partes" || perfil.oficina_id === documento.oficina_actual_id;
    if (!tieneAcceso) return NextResponse.json({ error: "No autorizado para este expediente." }, { status: 403 });

    const nombreUgel = process.env.NEXT_PUBLIC_NOMBRE_UGEL || "UGEL";
    const urlSistema = process.env.NEXT_PUBLIC_SITE_URL || "";
    let enviados = 0;

    if (tipo === "recibido" || tipo === "derivado") {
      const { data: destinatarios } = await admin.from("perfiles").select("email, nombres").eq("oficina_id", documento.oficina_actual_id).in("rol", ["mesa_partes", "jefe_oficina"]);
      for (const d of destinatarios || []) {
        if (!d.email) continue;
        await enviarCorreoBrevo({ to: d.email, subject: `Nuevo expediente en su bandeja · ${documento.codigo_expediente}`, html: `<p>Hola ${d.nombres || ""},</p><p>Tiene un nuevo expediente asignado a su oficina en el sistema de ${nombreUgel}:</p><p><strong>${documento.codigo_expediente}</strong> — ${documento.asunto}</p>${urlSistema ? `<p><a href="${urlSistema}/dashboard/bandeja">Ver mi bandeja de trámites</a></p>` : ""}` });
        enviados++;
      }
    }
    if (tipo === "estado") {
      const { data: emisor } = await admin.from("perfiles").select("email, nombres").eq("id", documento.usuario_emisor_id).single();
      if (emisor?.email) {
        const estadoTexto = String(estado || documento.estado || "").replaceAll("_", " ");
        await enviarCorreoBrevo({ to: emisor.email, subject: `Actualización de su expediente ${documento.codigo_expediente}`, html: `<p>Hola ${emisor.nombres || ""},</p><p>Su expediente <strong>${documento.codigo_expediente}</strong> (${documento.asunto}) cambió de estado a:</p><p><strong>${estadoTexto}</strong></p>${urlSistema ? `<p><a href="${urlSistema}/consulta">Consultar mi expediente</a></p>` : ""}<p>Sistema de Mesa de Partes · ${nombreUgel}</p>` });
        enviados++;
      }
    }
    return NextResponse.json({ ok: true, enviados });
  } catch {
    return NextResponse.json({ error: "No se pudo procesar la notificación." }, { status: 500 });
  }
}
