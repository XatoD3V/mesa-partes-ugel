"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { ROLES, iniciales } from "@/lib/constants";
import { Search, AlertCircle, CheckCircle2 } from "lucide-react";

export default function UsuariosPage() {
  const supabase = supabaseBrowser();
  const [usuarios, setUsuarios] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [guardandoId, setGuardandoId] = useState(null);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  async function cargar() {
    setCargando(true);
    const [{ data: us }, { data: ofs }] = await Promise.all([
      supabase.from("perfiles").select("*").order("created_at", { ascending: false }),
      supabase.from("oficinas").select("id, nombre").eq("activo", true).order("orden"),
    ]);
    setUsuarios(us || []);
    setOficinas(ofs || []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function actualizar(id, cambios) {
    setError("");
    setOk("");
    setGuardandoId(id);
    const { error } = await supabase.from("perfiles").update(cambios).eq("id", id);
    setGuardandoId(null);
    if (error) return setError(error.message);
    setOk("Actualizado correctamente");
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...cambios } : u)));
    setTimeout(() => setOk(""), 2000);
  }

  const filtrados = usuarios.filter((u) =>
    `${u.nombres} ${u.apellidos} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-tinta-950">Usuarios</h1>
          <p className="mt-1 text-sm text-tinta-700">Asigna rol y oficina al personal de la UGEL.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-500" />
          <input className="input-legajo pl-9" placeholder="Buscar usuario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>

      {ok && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-salvia-100 p-3 text-sm text-salvia">
          <CheckCircle2 size={16} /> {ok}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-sello-100 p-3 text-sm text-sello">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="card-folio mt-5 p-0">
        {cargando && <p className="px-5 py-10 text-center text-sm text-tinta-600">Cargando...</p>}
        {filtrados.map((u) => (
          <div key={u.id} className="flex flex-col gap-3 border-b border-papel-300 px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tinta-800 text-xs font-semibold text-papel-100">
                {iniciales(u.nombres, u.apellidos)}
              </div>
              <div>
                <p className="text-sm font-medium text-tinta-950">{u.nombres} {u.apellidos}</p>
                <p className="text-xs text-tinta-600">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                disabled={guardandoId === u.id}
                className="input-legajo !py-1.5 text-sm"
                value={u.rol}
                onChange={(e) => actualizar(u.id, { rol: e.target.value })}
              >
                {Object.entries(ROLES).map(([valor, etiqueta]) => (
                  <option key={valor} value={valor}>{etiqueta}</option>
                ))}
              </select>
              <select
                disabled={guardandoId === u.id || u.rol === "externo"}
                className="input-legajo !py-1.5 text-sm"
                value={u.oficina_id || ""}
                onChange={(e) => actualizar(u.id, { oficina_id: e.target.value || null })}
              >
                <option value="">Sin oficina</option>
                {oficinas.map((o) => (
                  <option key={o.id} value={o.id}>{o.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
