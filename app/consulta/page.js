"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import EstadoBadge from "@/components/EstadoBadge";
import { formatoFecha } from "@/lib/constants";
import { Building2, Search, FileWarning } from "lucide-react";

export default function ConsultaPage() {
  const supabase = supabaseBrowser();
  const [codigo, setCodigo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [noEncontrado, setNoEncontrado] = useState(false);

  async function buscar(e) {
    e.preventDefault();
    setCargando(true);
    setNoEncontrado(false);
    setResultado(null);

    const { data, error } = await supabase.rpc("consultar_expediente", {
      p_codigo: codigo.trim().toUpperCase(),
    });

    if (error || !data || data.length === 0) {
      setNoEncontrado(true);
      setCargando(false);
      return;
    }

    setResultado(data[0]);

    const { data: hist } = await supabase.rpc("consultar_expediente_historial", {
      p_codigo: codigo.trim().toUpperCase(),
    });
    setHistorial(hist || []);
    setCargando(false);
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-tinta-900 text-papel-100">
            <Building2 size={18} />
          </div>
          <span className="font-display font-semibold text-tinta-950">Mesa de Partes</span>
        </Link>

        <div className="card-folio p-7">
          <h1 className="font-display text-xl font-semibold text-tinta-950">
            Consultar estado de expediente
          </h1>
          <p className="mt-1 text-sm text-tinta-700">
            Ingresa el código que recibiste al registrar tu documento. Ejemplo: UGEL-2026-000123
          </p>

          <form onSubmit={buscar} className="mt-5 flex gap-2">
            <input
              required
              className="input-legajo font-mono"
              placeholder="UGEL-2026-000123"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
            <button type="submit" disabled={cargando} className="btn-sello shrink-0">
              <Search size={16} />
              {cargando ? "..." : "Buscar"}
            </button>
          </form>

          {noEncontrado && (
            <div className="mt-5 flex items-start gap-2 rounded-md bg-sello-100 p-3 text-sm text-sello">
              <FileWarning size={16} className="mt-0.5 shrink-0" />
              No se encontró ningún expediente con ese código. Verifica que esté bien escrito.
            </div>
          )}

          {resultado && (
            <div className="mt-6 border-t border-papel-300 pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm text-tinta-600">{resultado.codigo_expediente}</p>
                  <p className="mt-0.5 font-display text-base font-semibold text-tinta-950">
                    {resultado.asunto}
                  </p>
                  <p className="text-xs text-tinta-600">{resultado.tipo_documento}</p>
                </div>
                <EstadoBadge estado={resultado.estado} />
              </div>

              {resultado.oficina_actual && (
                <p className="mt-3 text-sm text-tinta-800">
                  Oficina actual: <strong>{resultado.oficina_actual}</strong>
                </p>
              )}

              <ol className="mt-5 space-y-4 border-l-2 border-papel-300 pl-4">
                {historial.map((h, i) => (
                  <li key={i} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-tinta-700" />
                    <p className="font-medium text-tinta-950">
                      {h.estado.replaceAll("_", " ")}
                      {h.oficina ? ` · ${h.oficina}` : ""}
                    </p>
                    {h.comentario && <p className="text-xs text-tinta-700">{h.comentario}</p>}
                    <p className="text-xs text-tinta-600">{formatoFecha(h.created_at)}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
