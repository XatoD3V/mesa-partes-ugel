"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import {
  Megaphone,
  Palette,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Image as ImageIcon,
  Hash,
} from "lucide-react";

const FUENTES_DISPONIBLES = ["Inter", "Roboto", "Poppins", "Merriweather", "Nunito", "Source Sans 3"];

export default function ConfiguracionPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  // Avisos
  const [avisos, setAvisos] = useState([]);
  const [nuevoAviso, setNuevoAviso] = useState({ mensaje: "", tipo: "info" });

  // Apariencia
  const [config, setConfig] = useState({
    color_primario: "#152F4A",
    color_fondo: "#F7F3EA",
    fuente_body: "Inter",
    favicon_url: "",
    prefijo_expediente: "UGEL",
  });
  const [subiendoFavicon, setSubiendoFavicon] = useState(false);
  const [reiniciandoNumero, setReiniciandoNumero] = useState(false);

  // Reinicio total
  const [mostrarReinicio, setMostrarReinicio] = useState(false);
  const [textoConfirmacion, setTextoConfirmacion] = useState("");
  const [reiniciando, setReiniciando] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user.id).single();
      if (!perfil || perfil.rol !== "admin") {
        router.push("/dashboard");
        return;
      }
      setEsAdmin(true);

      const [{ data: av }, { data: cfg }] = await Promise.all([
        supabase.from("avisos").select("*").order("created_at", { ascending: false }),
        supabase.from("configuracion_sitio").select("*").eq("id", 1).single(),
      ]);
      setAvisos(av || []);
      if (cfg) setConfig(cfg);
      setCargando(false);
    })();
  }, []);

  function flashOk(msg) {
    setOk(msg);
    setTimeout(() => setOk(""), 2500);
  }

  // ---- Avisos ----
  async function crearAviso(e) {
    e.preventDefault();
    if (!nuevoAviso.mensaje.trim()) return;
    const { data, error } = await supabase.from("avisos").insert(nuevoAviso).select().single();
    if (error) return setError(error.message);
    setAvisos((prev) => [data, ...prev]);
    setNuevoAviso({ mensaje: "", tipo: "info" });
    flashOk("Aviso publicado");
  }

  async function toggleAviso(a) {
    await supabase.from("avisos").update({ activo: !a.activo }).eq("id", a.id);
    setAvisos((prev) => prev.map((x) => (x.id === a.id ? { ...x, activo: !x.activo } : x)));
  }

  async function eliminarAviso(a) {
    await supabase.from("avisos").delete().eq("id", a.id);
    setAvisos((prev) => prev.filter((x) => x.id !== a.id));
  }

  // ---- Apariencia ----
  async function guardarApariencia(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase
      .from("configuracion_sitio")
      .update({
        color_primario: config.color_primario,
        color_fondo: config.color_fondo,
        fuente_body: config.fuente_body,
        favicon_url: config.favicon_url || null,
        prefijo_expediente: config.prefijo_expediente || "UGEL",
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) return setError(error.message);
    flashOk("Apariencia actualizada. Recarga la página para verla aplicada en todo el sitio.");
  }

  async function subirFavicon(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setSubiendoFavicon(true);
    setError("");
    const ruta = `sitio/favicon-${Date.now()}-${archivo.name}`;
    const { error: uploadError } = await supabase.storage.from("documentos").upload(ruta, archivo);
    setSubiendoFavicon(false);
    if (uploadError) return setError(uploadError.message);
    const { data: pub } = supabase.storage.from("documentos").getPublicUrl(ruta);
    setConfig((c) => ({ ...c, favicon_url: pub.publicUrl }));
  }

  async function reiniciarNumeracion() {
    if (!window.confirm("¿Reiniciar la numeración de expedientes desde 1? Los códigos ya emitidos no cambian, pero el próximo expediente usará el número 1.")) {
      return;
    }
    setReiniciandoNumero(true);
    const { error } = await supabase.rpc("reiniciar_correlativo_expediente");
    setReiniciandoNumero(false);
    if (error) return setError(error.message);
    flashOk("La numeración de expedientes se reinició a 1.");
  }

  // ---- Reinicio total ----
  async function reiniciarSistema() {
    setError("");
    setReiniciando(true);
    const res = await fetch("/api/admin/reiniciar-sistema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmacion: textoConfirmacion }),
    });
    const data = await res.json();
    setReiniciando(false);
    if (!res.ok) {
      setError(data.error || "No se pudo reiniciar el sistema.");
      return;
    }
    setMostrarReinicio(false);
    setTextoConfirmacion("");
    alert("El sistema se reinició correctamente. Se cerrará tu sesión para que vuelvas a entrar.");
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (cargando || !esAdmin) return <p className="text-sm text-tinta-600">Cargando...</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-tinta-950">Configuración del sistema</h1>
        <p className="mt-1 text-sm text-tinta-700">Avisos públicos, apariencia del sitio y opciones avanzadas.</p>
      </div>

      {ok && (
        <div className="flex items-center gap-2 rounded-md bg-salvia-100 p-3 text-sm text-salvia">
          <CheckCircle2 size={16} /> {ok}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-sello-100 p-3 text-sm text-sello">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Avisos / Banners */}
      <section className="card-folio p-6">
        <div className="flex items-center gap-2">
          <Megaphone className="text-tinta-800" size={20} />
          <h2 className="font-display text-lg font-semibold text-tinta-950">Avisos en la página principal</h2>
        </div>
        <p className="mt-1 text-sm text-tinta-700">
          Los avisos activos aparecen como un banner arriba de la página de inicio del sistema.
        </p>

        <form onSubmit={crearAviso} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            className="input-legajo flex-1"
            placeholder="Ej: Atención presencial suspendida el 20 de agosto"
            value={nuevoAviso.mensaje}
            onChange={(e) => setNuevoAviso({ ...nuevoAviso, mensaje: e.target.value })}
          />
          <select
            className="input-legajo sm:w-40"
            value={nuevoAviso.tipo}
            onChange={(e) => setNuevoAviso({ ...nuevoAviso, tipo: e.target.value })}
          >
            <option value="info">Informativo</option>
            <option value="urgente">Urgente</option>
          </select>
          <button type="submit" className="btn-primario shrink-0">
            <Plus size={16} /> Publicar
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {avisos.length === 0 && <p className="text-sm text-tinta-600">Aún no hay avisos publicados.</p>}
          {avisos.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 rounded-md bg-papel-200/50 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm text-tinta-900">{a.mensaje}</p>
                <p className="text-xs text-tinta-600">{a.tipo === "urgente" ? "Urgente" : "Informativo"}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => toggleAviso(a)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    a.activo ? "bg-salvia-100 text-salvia" : "bg-papel-300 text-tinta-600"
                  }`}
                >
                  {a.activo ? "Activo" : "Oculto"}
                </button>
                <button onClick={() => eliminarAviso(a)} className="text-tinta-500 hover:text-sello">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Apariencia */}
      <section className="card-folio p-6">
        <div className="flex items-center gap-2">
          <Palette className="text-tinta-800" size={20} />
          <h2 className="font-display text-lg font-semibold text-tinta-950">Apariencia del sitio</h2>
        </div>
        <p className="mt-1 text-sm text-tinta-700">
          Cambia el color principal, el color de fondo y la tipografía de todo el sistema.
        </p>

        <form onSubmit={guardarApariencia} className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label-legajo">Color principal</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-12 cursor-pointer rounded border border-tinta-800/20"
                value={config.color_primario}
                onChange={(e) => setConfig({ ...config, color_primario: e.target.value })}
              />
              <input
                className="input-legajo"
                value={config.color_primario}
                onChange={(e) => setConfig({ ...config, color_primario: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label-legajo">Color de fondo</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                className="h-10 w-12 cursor-pointer rounded border border-tinta-800/20"
                value={config.color_fondo}
                onChange={(e) => setConfig({ ...config, color_fondo: e.target.value })}
              />
              <input
                className="input-legajo"
                value={config.color_fondo}
                onChange={(e) => setConfig({ ...config, color_fondo: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label-legajo">Tipografía de texto</label>
            <select
              className="input-legajo"
              value={config.fuente_body}
              onChange={(e) => setConfig({ ...config, fuente_body: e.target.value })}
            >
              {FUENTES_DISPONIBLES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primario sm:col-span-3">
            Guardar apariencia
          </button>
        </form>

        <div className="mt-6 grid gap-4 border-t border-papel-300 pt-6 sm:grid-cols-2">
          <div>
            <label className="label-legajo">Ícono del sitio (favicon)</label>
            <div className="flex items-center gap-3">
              {config.favicon_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={config.favicon_url} alt="Favicon actual" className="h-9 w-9 rounded border border-papel-300 object-contain" />
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-tinta-800/30 bg-papel-200/40 px-3 py-2.5 text-xs text-tinta-700 hover:bg-papel-200">
                <ImageIcon size={15} />
                {subiendoFavicon ? "Subiendo..." : "Cambiar ícono"}
                <input type="file" accept="image/*" className="hidden" onChange={subirFavicon} />
              </label>
            </div>
            <p className="mt-1 text-xs text-tinta-600">Recomendado: imagen cuadrada (PNG o ICO).</p>
          </div>

          <div>
            <label className="label-legajo">Prefijo del código de expediente</label>
            <div className="flex items-center gap-2">
              <Hash size={16} className="text-tinta-500" />
              <input
                className="input-legajo"
                value={config.prefijo_expediente}
                onChange={(e) => setConfig({ ...config, prefijo_expediente: e.target.value.toUpperCase() })}
                placeholder="UGEL"
              />
            </div>
            <p className="mt-1 text-xs text-tinta-600">
              Ej: con "UGEL" los códigos salen como UGEL-2026-000123. Guarda con el botón de arriba.
            </p>
            <button
              type="button"
              onClick={reiniciarNumeracion}
              disabled={reiniciandoNumero}
              className="btn-secundario mt-2 !py-1.5 text-xs"
            >
              <RotateCcw size={13} /> {reiniciandoNumero ? "Reiniciando..." : "Reiniciar numeración a 1"}
            </button>
          </div>
        </div>
      </section>

      {/* Zona de peligro */}
      <section className="card-folio border-2 border-sello/30 p-6">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-sello" size={20} />
          <h2 className="font-display text-lg font-semibold text-sello">Zona de peligro</h2>
        </div>
        <p className="mt-1 text-sm text-tinta-700">
          Reinicia el sistema por completo: borra TODOS los expedientes, derivaciones, historial y
          notificaciones, y elimina TODAS las cuentas de usuario excepto las de administrador.
          Esta acción no se puede deshacer.
        </p>

        {!mostrarReinicio ? (
          <button onClick={() => setMostrarReinicio(true)} className="btn-sello mt-4">
            <RotateCcw size={16} /> Reiniciar sistema por completo
          </button>
        ) : (
          <div className="mt-4 rounded-md bg-sello-100 p-4">
            <p className="text-sm font-medium text-sello">
              Para confirmar, escribe la palabra <strong>REINICIAR</strong> en el siguiente campo:
            </p>
            <input
              className="input-legajo mt-2"
              value={textoConfirmacion}
              onChange={(e) => setTextoConfirmacion(e.target.value)}
              placeholder="REINICIAR"
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={reiniciarSistema}
                disabled={textoConfirmacion !== "REINICIAR" || reiniciando}
                className="btn-sello"
              >
                {reiniciando ? "Reiniciando..." : "Sí, borrar todo y reiniciar"}
              </button>
              <button
                onClick={() => {
                  setMostrarReinicio(false);
                  setTextoConfirmacion("");
                }}
                className="btn-secundario"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
