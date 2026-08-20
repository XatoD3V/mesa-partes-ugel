"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { ROLES, formatoFecha } from "@/lib/constants";
import { Search, AlertCircle, CheckCircle2, Trash2, Archive } from "@/components/icons";

export default function HistorialUsuariosPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [miId, setMiId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [editValores, setEditValores] = useState({ numero_documento: "", telefono: "" });
  const [guardandoId, setGuardandoId] = useState(null);

  async function cargar() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
    if (!perfil || perfil.rol !== "admin") {
      return router.push("/dashboard");
    }
    setEsAdmin(true);
    setMiId(user.id);

    const { data } = await supabase
      .from("perfiles")
      .select("*")
      .order("created_at", { ascending: false });
    setRegistros(data || []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function eliminarRegistro(r) {
    if (
      !window.confirm(
        `¿Eliminar el registro de ${r.nombres} ${r.apellidos}?\n\nEsto borra su cuenta por completo (no solo el historial) y no se puede deshacer.`
      )
    ) {
      return;
    }
    setError("");
    setEliminandoId(r.id);
    const res = await fetch("/api/admin/eliminar-usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id }),
    });
    const data = await res.json();
    setEliminandoId(null);
    if (!res.ok) {
      setError(data.error || "No se pudo eliminar el registro.");
      return;
    }
    setRegistros((prev) => prev.filter((x) => x.id !== r.id));
    setOk("Registro eliminado correctamente");
    setTimeout(() => setOk(""), 2500);
  }

  function empezarEdicion(r) {
    setError("");
    setEditandoId(r.id);
    setEditValores({ numero_documento: r.numero_documento || "", telefono: r.telefono || "" });
  }

  async function guardarEdicion(r) {
    setGuardandoId(r.id);
    const { error } = await supabase
      .from("perfiles")
      .update({
        numero_documento: editValores.numero_documento || null,
        telefono: editValores.telefono || null,
      })
      .eq("id", r.id);
    setGuardandoId(null);
    if (error) {
      setError(error.message);
      return;
    }
    setRegistros((prev) =>
      prev.map((x) => (x.id === r.id ? { ...x, numero_documento: editValores.numero_documento, telefono: editValores.telefono } : x))
    );
    setEditandoId(null);
    setOk("Datos actualizados correctamente");
    setTimeout(() => setOk(""), 2000);
  }

  const filtrados = registros.filter((r) =>
    `${r.nombres} ${r.apellidos} ${r.email} ${r.numero_documento || ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  if (cargando || !esAdmin)
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-64" />
        <div className="card-folio space-y-3 p-6">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-4/6" />
        </div>
      </div>
    );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-tinta-950">Historial de registros de usuarios</h1>
          <p className="mt-1 text-sm text-tinta-700">
            Todas las cuentas creadas en el sistema, con la fecha y los datos con los que se registraron.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-500" />
          <input
            className="input-legajo pl-9"
            placeholder="Buscar por nombre, correo o documento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
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

      <div className="card-folio mt-5 overflow-hidden p-0">
        <div className="hidden grid-cols-[1.4fr_1.4fr_1fr_1fr_130px_120px_50px] gap-3 border-b border-papel-300 bg-papel-200/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-tinta-600 md:grid">
          <span>Nombre</span>
          <span>Correo</span>
          <span>Documento</span>
          <span>Teléfono</span>
          <span>Rol</span>
          <span>Fecha de registro</span>
          <span></span>
        </div>

        {filtrados.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
            <Archive className="text-tinta-500" size={28} />
            <p className="text-sm text-tinta-600">No hay registros con este filtro.</p>
          </div>
        )}

        {filtrados.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-1 gap-2 border-b border-papel-300 px-5 py-4 text-sm last:border-0 md:grid-cols-[1.4fr_1.4fr_1fr_1fr_130px_120px_50px] md:items-center md:gap-3"
          >
            <span className="font-medium text-tinta-950">{r.nombres} {r.apellidos}</span>
            <span className="truncate text-tinta-700">{r.email}</span>

            {editandoId === r.id ? (
              <input
                className="input-legajo !py-1.5 text-sm"
                placeholder="N.º de DNI"
                value={editValores.numero_documento}
                onChange={(e) => setEditValores((v) => ({ ...v, numero_documento: e.target.value }))}
              />
            ) : (
              <span className="text-tinta-700">{r.tipo_documento || "DNI"} {r.numero_documento || "—"}</span>
            )}

            {editandoId === r.id ? (
              <input
                className="input-legajo !py-1.5 text-sm"
                placeholder="Teléfono"
                value={editValores.telefono}
                onChange={(e) => setEditValores((v) => ({ ...v, telefono: e.target.value }))}
              />
            ) : (
              <span className="text-tinta-700">{r.telefono || "—"}</span>
            )}

            <span className="text-tinta-700">{ROLES[r.rol] || r.rol}</span>
            <span className="text-xs text-tinta-600">{formatoFecha(r.created_at)}</span>
            <div className="flex justify-end gap-1">
              {editandoId === r.id ? (
                <>
                  <button
                    onClick={() => guardarEdicion(r)}
                    disabled={guardandoId === r.id}
                    title="Guardar"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-tinta-500 transition-colors hover:bg-salvia-100 hover:text-salvia disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => setEditandoId(null)}
                    title="Cancelar"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-tinta-500 transition-colors hover:bg-papel-200"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <button
                  onClick={() => empezarEdicion(r)}
                  title="Editar DNI / teléfono"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-tinta-500 transition-colors hover:bg-papel-200"
                >
                  ✎
                </button>
              )}
              {r.id !== miId && (
                <button
                  onClick={() => eliminarRegistro(r)}
                  disabled={eliminandoId === r.id}
                  title="Eliminar este registro"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-tinta-500 transition-colors hover:bg-sello-100 hover:text-sello disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
