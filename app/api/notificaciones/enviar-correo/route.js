import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { enviarCorreoBrevo } from "@/lib/brevo";

export async function POST(request) {
  try {
    // Verifica que quien llama esté autenticado (no exponemos esto públicamente)
    const supabase = supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const { documento_id, tipo, estado } = await request.json();
    if (!documento_id || !tipo) {
      return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
    }

    const admin = supabaseAdmin();
    const nombreUgel = process.env.NEXT_PUBLIC_NOMBRE_UGEL || "UGEL";
    const urlSistema = process.env.NEXT_PUBLIC_SITE_URL || "";

    const { data: documento } = await admin
      .from("documentos")
      .select("codigo_expediente, asunto, oficina_actual_id, usuario_emisor_id, estado")
      .eq("id", documento_id)
      .single();

    if (!documento) {
      return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
    }

    let enviados = 0;

    // Caso 1: documento nuevo o recién derivado -> avisa al personal de la oficina destino
    if (tipo === "recibido" || tipo === "derivado") {
      const { data: destinatarios } = await admin
        .from("perfiles")
        .select("email, nombres")
        .eq("oficina_id", documento.oficina_actual_id)
        .in("rol", ["mesa_partes", "jefe_oficina"]);

      for (const d of destinatarios || []) {
        if (!d.email) continue;
        await enviarCorreoBrevo({
          to: d.email,
          subject: `Nuevo expediente en su bandeja · ${documento.codigo_expediente}`,
          html: `
            <p>Hola ${d.nombres || ""},</p>
            <p>Tiene un nuevo expediente asignado a su oficina en el sistema de ${nombreUgel}:</p>
            <p><strong>${documento.codigo_expediente}</strong> — ${documento.asunto}</p>
            ${urlSistema ? `<p><a href="${urlSistema}/dashboard/bandeja">Ver mi bandeja de trámites</a></p>` : ""}
          `,
        });
        enviados++;
      }
    }

    // Caso 2: cambio de estado -> avisa al ciudadano/docente que envió el documento
    if (tipo === "estado") {
      const { data: emisor } = await admin
        .from("perfiles")
        .select("email, nombres")
        .eq("id", documento.usuario_emisor_id)
        .single();

      if (emisor?.email) {
        const estadoTexto = (estado || documento.estado || "").replaceAll("_", " ");
        await enviarCorreoBrevo({
          to: emisor.email,
          subject: `Actualización de su expediente ${documento.codigo_expediente}`,
          html: `
            <p>Hola ${emisor.nombres || ""},</p>
            <p>Su expediente <strong>${documento.codigo_expediente}</strong> (${documento.asunto}) cambió de estado a:</p>
            <p style="font-size:16px;"><strong>${estadoTexto}</strong></p>
            ${urlSistema ? `<p><a href="${urlSistema}/consulta">Consultar mi expediente</a></p>` : ""}
            <p>Sistema de Mesa de Partes · ${nombreUgel}</p>
          `,
        });
        enviados++;
      }
    }

    return NextResponse.json({ ok: true, enviados });
  } catch (err) {
    // No queremos que un fallo de correo tumbe la acción principal (derivar/cambiar estado),
    // por eso este endpoint se llama "en segundo plano" desde el cliente.
    return NextResponse.json({ error: err.message || "Error inesperado." }, { status: 500 });
  }
}
