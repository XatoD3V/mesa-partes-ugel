"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { ROLES, iniciales } from "@/lib/constants";
import { Search, AlertCircle, CheckCircle2, UserPlus, X, Trash2 } from "@/components/icons";

export default function UsuariosPage() {
  const supabase = supabaseBrowser();
  const [usuarios, setUsuarios] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [guardandoId, setGuardandoId] = useState(null);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [creando, setCreando] = useState(false);
  const [errorCrear, setErrorCrear] = useState("");
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    numero_documento: "",
    telefono: "",
    rol: "jefe_oficina",
    oficina_id: "",
  });
  const [miId, setMiId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);

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
    supabase.auth.getUser().then(({ data }) => setMiId(data?.user?.id || null));
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

  async function crearUsuario(e) {
    e.preventDefault();
    setErrorCrear("");
    setCreando(true);

    const res = await fetch("/api/admin/crear-usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario),
    });
    const data = await res.json();
    setCreando(false);

    if (!res.ok) {
      setErrorCrear(data.error || "No se pudo crear el usuario.");
      return;
    }

    setMostrarFormulario(false);
    setNuevoUsuario({ nombres: "", apellidos: "", email: "", password: "", numero_documento: "", telefono: "", rol: "jefe_oficina", oficina_id: "" });
    setOk("Usuario creado correctamente");
    setTimeout(() => setOk(""), 2500);
    cargar();
  }

  async function eliminarUsuario(u) {
    if (!window.confirm(`¿Eliminar definitivamente la cuenta de ${u.nombres} ${u.apellidos}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }
    setError("");
    setEliminandoId(u.id);
    const res = await fetch("/api/admin/eliminar-usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: u.id }),
    });
    const data = await res.json();
    setEliminandoId(null);
    if (!res.ok) {
      setError(data.error || "No se pudo eliminar el usuario.");
      return;
    }
    setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
    setOk("Usuario eliminado correctamente");
    setTimeout(() => setOk(""), 2500);
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
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tinta-500" />
            <input className="input-legajo pl-9" placeholder="Buscar usuario..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </div>
          <button onClick={() => setMostrarFormulario(true)} className="btn-sello shrink-0">
            <UserPlus size={16} /> Crear usuario
          </button>
        </div>
      </div>

      {mostrarFormulario && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-tinta-950/40 p-4">
          <div className="card-folio w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-tinta-950">Crear cuenta de personal</h2>
              <button onClick={() => setMostrarFormulario(false)} className="text-tinta-500 hover:text-tinta-950">
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-tinta-700">
              La cuenta queda lista de inmediato, con correo confirmado, rol y oficina asignados.
            </p>

            <form onSubmit={crearUsuario} className="mt-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-legajo">Nombres</label>
                  <input required className="input-legajo" value={nuevoUsuario.nombres} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombres: e.target.value })} />
                </div>
                <div>
                  <label className="label-legajo">Apellidos</label>
                  <input required className="input-legajo" value={nuevoUsuario.apellidos} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellidos: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label-legajo">Correo electrónico</label>
                <input type="email" required className="input-legajo" value={nuevoUsuario.email} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-legajo">N.º de DNI</label>
                  <input className="input-legajo" value={nuevoUsuario.numero_documento} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, numero_documento: e.target.value })} />
                </div>
                <div>
                  <label className="label-legajo">Teléfono</label>
                  <input className="input-legajo" value={nuevoUsuario.telefono} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, telefono: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label-legajo">Contraseña temporal</label>
                <input type="text" required minLength={6} className="input-legajo" placeholder="Mínimo 6 caracteres" value={nuevoUsuario.password} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })} />
                <p className="mt-1 text-xs text-tinta-600">Compártela con el trabajador; podrá cambiarla luego.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-legajo">Rol</label>
                  <select className="input-legajo" value={nuevoUsuario.rol} onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}>
                    {Object.entries(ROLES).map(([valor, etiqueta]) => (
                      <option key={valor} value={valor}>{etiqueta}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-legajo">Oficina</label>
                  <select
                    disabled={nuevoUsuario.rol === "externo"}
                    className="input-legajo"
                    value={nuevoUsuario.oficina_id}
                    onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, oficina_id: e.target.value })}
                  >
                    <option value="">Sin oficina</option>
                    {oficinas.map((o) => (
                      <option key={o.id} value={o.id}>{o.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {errorCrear && (
                <div className="flex items-start gap-2 rounded-md bg-sello-100 p-3 text-sm text-sello">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" /> {errorCrear}
                </div>
              )}

              <button type="submit" disabled={creando} className="btn-primario w-full">
                {creando ? "Creando..." : "Crear cuenta"}
              </button>
            </form>
          </div>
        </div>
      )}

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
        {cargando && (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton h-9 w-9 shrink-0 rounded-full" />
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-4 w-20" />
              </div>
            ))}
          </div>
        )}
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
              {u.id !== miId && (
                <button
                  onClick={() => eliminarUsuario(u)}
                  disabled={eliminandoId === u.id}
                  title="Eliminar usuario"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-tinta-500 hover:bg-sello-100 hover:text-sello disabled:opacity-50"
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
