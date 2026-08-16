import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import EstadoBadge from "@/components/EstadoBadge";
import { formatoFecha } from "@/lib/constants";
import { FileText, Inbox, ArrowRight, Clock3 } from "@/components/icons";

export default async function DashboardHome() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*, oficina:oficina_id(nombre)")
    .eq("id", user.id)
    .single();

  const esExterno = perfil.rol === "externo";

  if (esExterno) {
    const { data: documentos } = await supabase
      .from("documentos")
      .select("id, codigo_expediente, asunto, estado, created_at")
      .eq("usuario_emisor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6);

    const conteos = { recibido: 0, en_proceso: 0, derivado: 0, atendido: 0 };
    (documentos || []).forEach((d) => {
      if (conteos[d.estado] !== undefined) conteos[d.estado]++;
    });

    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-tinta-950">
            Hola, {perfil.nombres} 👋
          </h1>
          <p className="mt-1 text-sm text-tinta-700">
            Este es el resumen de tus trámites ante la UGEL.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/dashboard/nuevo-documento" className="card-folio flex items-center gap-4 p-5 transition hover:-translate-y-0.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-sello-100 text-sello">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-medium text-tinta-950">Enviar nuevo documento</p>
              <p className="text-xs text-tinta-600">Solicitud, oficio, queja...</p>
            </div>
          </Link>
          <div className="card-folio p-5">
            <p className="text-xs uppercase tracking-wide text-tinta-600">En trámite</p>
            <p className="mt-1 font-display text-3xl font-semibold text-tinta-950">
              {conteos.en_proceso + conteos.derivado}
            </p>
          </div>
          <div className="card-folio p-5">
            <p className="text-xs uppercase tracking-wide text-tinta-600">Atendidos</p>
            <p className="mt-1 font-display text-3xl font-semibold text-tinta-950">{conteos.atendido}</p>
          </div>
        </div>

        <div className="card-folio p-0">
          <div className="flex items-center justify-between border-b border-papel-300 px-5 py-4">
            <p className="font-display text-base font-semibold text-tinta-950">Documentos recientes</p>
            <Link href="/dashboard/mis-documentos" className="flex items-center gap-1 text-sm font-medium text-tinta-800 hover:text-tinta-950">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          {(!documentos || documentos.length === 0) && (
            <p className="px-5 py-8 text-center text-sm text-tinta-600">
              Aún no has enviado ningún documento.
            </p>
          )}
          {(documentos || []).map((d) => (
            <Link
              key={d.id}
              href={`/dashboard/documento/${d.id}`}
              className="flex items-center justify-between gap-3 border-b border-papel-300 px-5 py-4 last:border-0 hover:bg-papel-200/40"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-tinta-950">{d.asunto}</p>
                <p className="font-mono text-xs text-tinta-600">{d.codigo_expediente}</p>
              </div>
              <EstadoBadge estado={d.estado} />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ---- Vista para personal de la UGEL (mesa_partes, jefe_oficina, admin) ----
  let query = supabase
    .from("documentos")
    .select("id, codigo_expediente, asunto, estado, created_at, oficina_actual:oficina_actual_id(nombre)")
    .order("created_at", { ascending: false })
    .limit(8);

  if (perfil.rol === "jefe_oficina") {
    query = query.eq("oficina_actual_id", perfil.oficina_id);
  }

  const { data: documentos } = await query;

  const { count: pendientes } = await (perfil.rol === "jefe_oficina"
    ? supabase
        .from("documentos")
        .select("id", { count: "exact", head: true })
        .eq("oficina_actual_id", perfil.oficina_id)
        .in("estado", ["derivado", "en_proceso"])
    : supabase
        .from("documentos")
        .select("id", { count: "exact", head: true })
        .in("estado", ["recibido", "derivado", "en_proceso"]));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-tinta-950">
          Hola, {perfil.nombres} 👋
        </h1>
        <p className="mt-1 text-sm text-tinta-700">
          {perfil.rol === "jefe_oficina"
            ? `Bandeja de la oficina de ${perfil.oficina?.nombre || ""}`
            : "Panel general de trámite documentario"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/bandeja" className="card-folio flex items-center gap-4 p-5 transition hover:-translate-y-0.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-tinta-100 text-tinta-800">
            <Inbox size={20} />
          </div>
          <div>
            <p className="font-medium text-tinta-950">Ir a la bandeja</p>
            <p className="text-xs text-tinta-600">Atender y derivar expedientes</p>
          </div>
        </Link>
        <div className="card-folio p-5">
          <p className="text-xs uppercase tracking-wide text-tinta-600">Pendientes</p>
          <p className="mt-1 font-display text-3xl font-semibold text-tinta-950">{pendientes ?? 0}</p>
        </div>
        <div className="card-folio flex items-center gap-3 p-5">
          <Clock3 className="text-ambar" size={22} />
          <p className="text-sm text-tinta-700">Tiempos de atención en <Link href="/dashboard/reportes" className="underline">Reportes</Link></p>
        </div>
      </div>

      <div className="card-folio p-0">
        <div className="flex items-center justify-between border-b border-papel-300 px-5 py-4">
          <p className="font-display text-base font-semibold text-tinta-950">Últimos movimientos</p>
        </div>
        {(!documentos || documentos.length === 0) && (
          <p className="px-5 py-8 text-center text-sm text-tinta-600">No hay expedientes por aquí.</p>
        )}
        {(documentos || []).map((d) => (
          <Link
            key={d.id}
            href={`/dashboard/documento/${d.id}`}
            className="flex items-center justify-between gap-3 border-b border-papel-300 px-5 py-4 last:border-0 hover:bg-papel-200/40"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-tinta-950">{d.asunto}</p>
              <p className="font-mono text-xs text-tinta-600">
                {d.codigo_expediente} {d.oficina_actual ? `· ${d.oficina_actual.nombre}` : ""}
              </p>
            </div>
            <EstadoBadge estado={d.estado} />
          </Link>
        ))}
      </div>
    </div>
  );
}
