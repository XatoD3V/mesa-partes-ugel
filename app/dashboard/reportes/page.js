import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { ESTADOS } from "@/lib/constants";
import ExportarReportePDF from "@/components/ExportarReportePDF";
import { Building2 } from "@/components/icons";

export default async function ReportesPage() {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", user.id).single();
  if (!perfil || perfil.rol === "externo") redirect("/dashboard");

  const { data: documentos } = await supabase
    .from("documentos")
    .select("estado, oficina_actual:oficina_actual_id(nombre), created_at");

  const { data: oficinas } = await supabase.from("oficinas").select("id, nombre").eq("activo", true).order("orden");

  const total = documentos?.length || 0;
  const porEstado = {};
  Object.keys(ESTADOS).forEach((e) => (porEstado[e] = 0));
  (documentos || []).forEach((d) => {
    if (porEstado[d.estado] !== undefined) porEstado[d.estado]++;
  });

  const porOficina = {};
  (documentos || []).forEach((d) => {
    const nombre = d.oficina_actual?.nombre || "Sin asignar";
    porOficina[nombre] = (porOficina[nombre] || 0) + 1;
  });
  const maxOficina = Math.max(1, ...Object.values(porOficina));

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-tinta-950">Reportes</h1>
          <p className="mt-1 text-sm text-tinta-700">Vista general del trámite documentario de la UGEL.</p>
        </div>
        <ExportarReportePDF
          total={total}
          porEstado={porEstado}
          porOficina={porOficina}
          nombreUgel={process.env.NEXT_PUBLIC_NOMBRE_UGEL || "UGEL"}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card-folio p-5">
          <p className="text-xs uppercase tracking-wide text-tinta-600">Total de expedientes</p>
          <p className="mt-1 font-display text-3xl font-semibold text-tinta-950">{total}</p>
        </div>
        {["recibido", "en_proceso", "atendido"].map((key) => (
          <div key={key} className="card-folio p-5">
            <p className="text-xs uppercase tracking-wide text-tinta-600">{ESTADOS[key].label}</p>
            <p className="mt-1 font-display text-3xl font-semibold text-tinta-950">{porEstado[key]}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-folio p-6">
          <h2 className="font-display text-base font-semibold text-tinta-950">Distribución por estado</h2>
          <div className="mt-5 space-y-3">
            {Object.entries(ESTADOS).map(([key, val]) => (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-xs text-tinta-700">
                  <span>{val.label}</span>
                  <span>{porEstado[key]}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-papel-300">
                  <div
                    className={`h-full ${val.dot}`}
                    style={{ width: `${total ? (porEstado[key] / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-folio p-6">
          <h2 className="font-display text-base font-semibold text-tinta-950">Expedientes por oficina</h2>
          <div className="mt-5 space-y-3">
            {oficinas.map((o) => (
              <div key={o.id} className="flex items-center gap-3">
                <Building2 size={14} className="shrink-0 text-tinta-500" />
                <span className="w-40 shrink-0 truncate text-sm text-tinta-800">{o.nombre}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-papel-300">
                  <div
                    className="h-full bg-tinta-700"
                    style={{ width: `${((porOficina[o.nombre] || 0) / maxOficina) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-sm font-medium text-tinta-950">
                  {porOficina[o.nombre] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
