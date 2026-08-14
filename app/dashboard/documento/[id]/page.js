"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import EstadoBadge from "@/components/EstadoBadge";
import SelloExpediente from "@/components/SelloExpediente";
import { formatoFecha } from "@/lib/constants";
import {
  ArrowLeft,
  Paperclip,
  Send,
  CheckCircle2,
  Archive,
  FileWarning,
  AlertCircle,
} from "lucide-react";

export default function DetalleDocumentoPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const [perfil, setPerfil] = useState(null);
  const [documento, setDocumento] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const [oficinaDestino, setOficinaDestino] = useState("");
  const [observacion, setObservacion] = useState("");

  const cargar = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: perfilData } = await supabase.from("perfiles").select("*").eq("id", user.id).single();
    setPerfil(perfilData);

    const { data: doc } = await supabase
      .from("documentos")
      .select(
        "*, oficina_actual:oficina_actual_id(id, nombre), emisor:usuario_emisor_id(nombres, apellidos, email, telefono)"
      )
      .eq("id", id)
      .single();
    setDocumento(doc);

    const { data: hist } = await supabase
      .from("documento_historial")
      .select("*, oficina:oficina_id(nombre), usuario:usuario_id(nombres, apellidos)")
      .eq("documento_id", id)
      .order("created_at", { ascending: true });
    setHistorial(hist || []);

    const { data: ofs } = await supabase.from("oficinas").select("id, nombre").eq("activo", true).order("orden");
    setOficinas(ofs || []);

    setCargando(false);
  }, [id]);

  useEffect(() => {
    cargar();
    const canal = supabase
      .channel("documento-" + id)
      .on("postgres_changes", { event: "*", schema: "public", table: "documentos", filter: `id=eq.${id}` }, cargar)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "documento_historial", filter: `documento_id=eq.${id}` }, cargar)
      .subscribe();
    return () => supabase.removeChannel(canal);
  }, [id, cargar]);

  async function derivar(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    const { error } = await supabase.rpc("derivar_documento", {
      p_documento_id: id,
      p_oficina_destino_id: oficinaDestino,
      p_observacion: observacion || null,
      p_nuevo_estado: "derivado",
    });
    setEnviando(false);
    if (error) return setError(error.message);
    setObservacion("");
    setOficinaDestino("");
    cargar();
  }

  async function cambiarEstado(nuevoEstado, comentario) {
    setError("");
    setEnviando(true);
    const { error } = await supabase.rpc("cambiar_estado_documento", {
      p_documento_id: id,
      p_nuevo_estado: nuevoEstado,
      p_comentario: comentario || null,
    });
    setEnviando(false);
    if (error) return setError(error.message);
    cargar();
  }

  if (cargando) return <p className="text-sm text-tinta-600">Cargando expediente...</p>;
  if (!documento) return <p className="text-sm text-tinta-600">No se encontró el expediente.</p>;

  const esPersonalUgel = ["mesa_partes", "jefe_oficina", "admin"].includes(perfil?.rol);
  const puedeActuar =
    perfil?.rol === "admin" ||
    perfil?.rol === "mesa_partes" ||
    (perfil?.rol === "jefe_oficina" && perfil?.oficina_id === documento.oficina_actual_id);

  return (
    <div className="mx-auto max-w-4xl">
      <button onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-sm text-tinta-700 hover:text-tinta-950">
        <ArrowLeft size={15} /> Volver
      </button>

      <div className="card-folio flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs text-tinta-600">{documento.codigo_expediente}</p>
          <h1 className="mt-1 font-display text-xl font-semibold text-tinta-950">{documento.asunto}</h1>
          <p className="mt-1 text-sm text-tinta-700">{documento.tipo_documento} · {documento.numero_folios} folio(s)</p>
          {documento.descripcion && <p className="mt-3 text-sm text-tinta-800">{documento.descripcion}</p>}

          {documento.archivo_url && (
            <a
              href={documento.archivo_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-tinta-800 underline underline-offset-2 hover:text-tinta-950"
            >
              <Paperclip size={15} /> {documento.archivo_nombre || "Ver archivo adjunto"}
            </a>
          )}

          {esPersonalUgel && (
            <div className="mt-4 rounded-md bg-papel-200/50 p-3 text-xs text-tinta-700">
              <p><strong>Remitente:</strong> {documento.emisor?.nombres} {documento.emisor?.apellidos}</p>
              {documento.emisor?.email && <p><strong>Correo:</strong> {documento.emisor.email}</p>}
              {documento.emisor?.telefono && <p><strong>Teléfono:</strong> {documento.emisor.telefono}</p>}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-3">
          <SelloExpediente codigo={documento.codigo_expediente} fecha={formatoFecha(documento.created_at).split(",")[0]} />
          <EstadoBadge estado={documento.estado} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Línea de tiempo */}
        <div className="card-folio p-6">
          <h2 className="font-display text-base font-semibold text-tinta-950">Trazabilidad del expediente</h2>
          <ol className="mt-5 space-y-5 border-l-2 border-papel-300 pl-4">
            {historial.map((h) => (
              <li key={h.id} className="relative text-sm">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-tinta-700" />
                <p className="font-medium capitalize text-tinta-950">
                  {h.estado.replaceAll("_", " ")} {h.oficina ? `· ${h.oficina.nombre}` : ""}
                </p>
                {h.comentario && <p className="text-tinta-700">{h.comentario}</p>}
                <p className="text-xs text-tinta-600">
                  {formatoFecha(h.created_at)}
                  {h.usuario ? ` · ${h.usuario.nombres} ${h.usuario.apellidos}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Acciones (solo personal UGEL) */}
        {esPersonalUgel && (
          <div className="space-y-4">
            {!puedeActuar && (
              <div className="card-folio p-4 text-xs text-tinta-600">
                Este expediente no está asignado a tu oficina, por lo que solo puedes visualizarlo.
              </div>
            )}
            {puedeActuar && (
              <>
                <form onSubmit={derivar} className="card-folio space-y-3 p-5">
                  <h3 className="font-display text-sm font-semibold text-tinta-950">Derivar a otra oficina</h3>
                  <select required className="input-legajo" value={oficinaDestino} onChange={(e) => setOficinaDestino(e.target.value)}>
                    <option value="">Selecciona oficina destino</option>
                    {oficinas.filter((o) => o.id !== documento.oficina_actual_id).map((o) => (
                      <option key={o.id} value={o.id}>{o.nombre}</option>
                    ))}
                  </select>
                  <textarea
                    rows={2}
                    placeholder="Observación (opcional)"
                    className="input-legajo resize-none"
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                  />
                  <button type="submit" disabled={enviando} className="btn-primario w-full">
                    <Send size={15} /> Derivar
                  </button>
                </form>

                <div className="card-folio space-y-2 p-5">
                  <h3 className="font-display text-sm font-semibold text-tinta-950">Actualizar estado</h3>
                  <button onClick={() => cambiarEstado("en_proceso")} disabled={enviando} className="btn-secundario w-full !justify-start">
                    <Send size={15} className="rotate-45" /> Marcar en proceso
                  </button>
                  <button onClick={() => cambiarEstado("observado", "El expediente requiere subsanación")} disabled={enviando} className="btn-secundario w-full !justify-start">
                    <FileWarning size={15} /> Observar
                  </button>
                  <button onClick={() => cambiarEstado("atendido", "Trámite atendido")} disabled={enviando} className="btn-secundario w-full !justify-start">
                    <CheckCircle2 size={15} /> Marcar atendido
                  </button>
                  <button onClick={() => cambiarEstado("archivado", "Expediente archivado")} disabled={enviando} className="btn-secundario w-full !justify-start">
                    <Archive size={15} /> Archivar
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md bg-sello-100 p-3 text-sm text-sello">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
