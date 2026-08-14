import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";
import EstadoBadge from "@/components/EstadoBadge";
import { formatoFecha } from "@/lib/constants";
import { FileText } from "lucide-react";

export default async function MisDocumentosPage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: documentos } = await supabase
    .from("documentos")
    .select("id, codigo_expediente, asunto, tipo_documento, estado, created_at, oficina_actual:oficina_actual_id(nombre)")
    .eq("usuario_emisor_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-tinta-950">Mis documentos</h1>
          <p className="mt-1 text-sm text-tinta-700">Historial completo de tus trámites ante la UGEL.</p>
        </div>
        <Link href="/dashboard/nuevo-documento" className="btn-sello">
          <FileText size={16} /> Enviar documento
        </Link>
      </div>

      <div className="card-folio mt-6 p-0">
        {(!documentos || documentos.length === 0) && (
          <p className="px-5 py-10 text-center text-sm text-tinta-600">
            Todavía no has enviado ningún documento.
          </p>
        )}
        {(documentos || []).map((d) => (
          <Link
            key={d.id}
            href={`/dashboard/documento/${d.id}`}
            className="flex flex-col gap-2 border-b border-papel-300 px-5 py-4 last:border-0 hover:bg-papel-200/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-tinta-950">{d.asunto}</p>
              <p className="font-mono text-xs text-tinta-600">
                {d.codigo_expediente} · {d.tipo_documento}
                {d.oficina_actual ? ` · ${d.oficina_actual.nombre}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-tinta-600">{formatoFecha(d.created_at)}</span>
              <EstadoBadge estado={d.estado} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
