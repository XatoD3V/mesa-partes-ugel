"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import EstadoBadge from "@/components/EstadoBadge";
import { formatoFecha } from "@/lib/constants";
import { Search, Inbox } from "@/components/icons";

const FILTROS = [
  { key: "activos", label: "Activos" },
  { key: "todos", label: "Todos" },
  { key: "recibido", label: "Recibidos" },
  { key: "derivado", label: "Derivados" },
  { key: "en_proceso", label: "En proceso" },
  { key: "observado", label: "Observados" },
  { key: "atendido", label: "Atendidos" },
  { key: "archivado", label: "Archivados" },
];

export default function BandejaCliente({ perfil }) {
  const supabase = supabaseBrowser();
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("activos");
  const [busqueda, setBusqueda] = useState("");

  async function cargar() {
    setCargando(true);
    let query = supabase
      .from("documentos")
      .select(
        "id, codigo_expediente, asunto, tipo_documento, estado, prioridad, created_at, oficina_actual:oficina_actual_id(nombre), emisor:usuario_emisor_id(nombres, apellidos)"
      )
      .order("created_at", { ascending: false });

    if (perfil.rol === "jefe_oficina") {
      query = query.eq("oficina_actual_id", perfil.oficina_id);
    }

    const { data } = await query;
    setDocumentos(data || []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    const canal = supabase
      .channel("bandeja-documentos")
      .on("postgres_changes", { event: "*", schema: "public", table: "documentos" }, () => cargar())
      .subscribe();
    return () => supabase.removeChannel(canal);
  }, []);

  const filtrados = useMemo(() => {
    let lista = documentos;
    if (filtro === "activos") {
      lista = lista.filter((d) => !["atendido", "archivado"].includes(d.estado));
    } else if (filtro !== "todos") {
      lista = lista.filter((d) => d.estado === filtro);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(
        (d) =>
          d.asunto.toLowerCase().includes(q) ||
          d.codigo_expediente.toLowerCase().includes(q) ||
          `${d.emisor?.nombres} ${d.emisor?.apellidos}`.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [documentos, filtro, busqueda]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-tinta-950">Bandeja de trámites</h1>
          <p className="mt-1 text-sm text-tinta-700">
            {perfil.rol === "jefe_oficina"
              ? "Expedientes asignados a tu oficina."
              : "Todos los expedientes registrados en el sistema."}
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-500" />
          <input
            className="input-legajo pl-9"
            placeholder="Buscar por código, asunto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltro(f.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filtro === f.key
                ? "bg-tinta-900 text-papel-100"
                : "bg-papel-200 text-tinta-700 hover:bg-papel-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card-folio mt-5 overflow-hidden p-0">
        <div className="hidden grid-cols-[1fr_140px_160px_120px_140px] gap-3 border-b border-papel-300 bg-papel-200/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-tinta-600 sm:grid">
          <span>Expediente</span>
          <span>Prioridad</span>
          <span>Oficina actual</span>
          <span>Estado</span>
          <span>Fecha</span>
        </div>

        {cargando && <p className="px-5 py-10 text-center text-sm text-tinta-600">Cargando...</p>}
        {!cargando && filtrados.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <Inbox className="text-tinta-400" size={28} />
            <p className="text-sm text-tinta-600">No hay expedientes con este filtro.</p>
          </div>
        )}

        {filtrados.map((d) => (
          <Link
            key={d.id}
            href={`/dashboard/documento/${d.id}`}
            className="grid grid-cols-1 gap-2 border-b border-papel-300 px-5 py-4 last:border-0 hover:bg-papel-200/40 sm:grid-cols-[1fr_140px_160px_120px_140px] sm:items-center"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-tinta-950">{d.asunto}</p>
              <p className="font-mono text-xs text-tinta-600">
                {d.codigo_expediente} · {d.emisor?.nombres} {d.emisor?.apellidos}
              </p>
            </div>
            <span className={`text-xs font-semibold ${d.prioridad === "urgente" ? "text-sello" : "text-tinta-500"}`}>
              {d.prioridad === "urgente" ? "Urgente" : "Normal"}
            </span>
            <span className="text-sm text-tinta-800">{d.oficina_actual?.nombre || "—"}</span>
            <EstadoBadge estado={d.estado} />
            <span className="text-xs text-tinta-600">{formatoFecha(d.created_at)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
