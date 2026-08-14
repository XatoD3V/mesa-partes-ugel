"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Building2, Plus, AlertCircle, Star, EyeOff, Eye } from "lucide-react";

export default function OficinasPage() {
  const supabase = supabaseBrowser();
  const [oficinas, setOficinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState({ codigo: "", nombre: "", descripcion: "", orden: 100 });
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    const { data } = await supabase.from("oficinas").select("*").order("orden");
    setOficinas(data || []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    const { error } = await supabase.from("oficinas").insert({
      codigo: nuevo.codigo.toUpperCase().replace(/\s+/g, "_"),
      nombre: nuevo.nombre,
      descripcion: nuevo.descripcion,
      orden: Number(nuevo.orden) || 100,
    });
    setGuardando(false);
    if (error) return setError(error.message);
    setNuevo({ codigo: "", nombre: "", descripcion: "", orden: 100 });
    cargar();
  }

  async function toggleActivo(oficina) {
    await supabase.from("oficinas").update({ activo: !oficina.activo }).eq("id", oficina.id);
    cargar();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-tinta-950">Oficinas de la UGEL</h1>
      <p className="mt-1 text-sm text-tinta-700">
        Recursos Humanos figura como oficina principal (orden 1). Puedes agregar más oficinas o desactivarlas.
      </p>

      <form onSubmit={crear} className="card-folio mt-6 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_100px_auto]">
        <input required placeholder="Nombre de la oficina" className="input-legajo" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
        <input required placeholder="Código (ej: TESORERIA)" className="input-legajo" value={nuevo.codigo} onChange={(e) => setNuevo({ ...nuevo, codigo: e.target.value })} />
        <input type="number" placeholder="Orden" className="input-legajo" value={nuevo.orden} onChange={(e) => setNuevo({ ...nuevo, orden: e.target.value })} />
        <button type="submit" disabled={guardando} className="btn-primario">
          <Plus size={16} /> Agregar
        </button>
        <textarea
          placeholder="Descripción (opcional)"
          className="input-legajo sm:col-span-4"
          rows={2}
          value={nuevo.descripcion}
          onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
        />
      </form>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-sello-100 p-3 text-sm text-sello">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      <div className="card-folio mt-6 p-0">
        {cargando && <p className="px-5 py-8 text-center text-sm text-tinta-600">Cargando...</p>}
        {oficinas.map((o, i) => (
          <div key={o.id} className="flex items-center justify-between gap-3 border-b border-papel-300 px-5 py-4 last:border-0">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-md ${i === 0 ? "bg-sello-100 text-sello" : "bg-tinta-100 text-tinta-800"}`}>
                {i === 0 ? <Star size={16} /> : <Building2 size={16} />}
              </div>
              <div>
                <p className="text-sm font-medium text-tinta-950">
                  {o.nombre} {i === 0 && <span className="ml-1 text-xs font-semibold text-sello">· Principal</span>}
                </p>
                <p className="font-mono text-xs text-tinta-600">{o.codigo}</p>
              </div>
            </div>
            <button
              onClick={() => toggleActivo(o)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${
                o.activo ? "bg-salvia-100 text-salvia" : "bg-papel-300 text-tinta-600"
              }`}
            >
              {o.activo ? <Eye size={13} /> : <EyeOff size={13} />}
              {o.activo ? "Activa" : "Inactiva"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
