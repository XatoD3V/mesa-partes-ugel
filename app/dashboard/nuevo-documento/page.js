"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { TIPOS_DOCUMENTO } from "@/lib/constants";
import { UploadCloud, Send, AlertCircle, CheckCircle2 } from "lucide-react";

export default function NuevoDocumentoPage() {
  const supabase = supabaseBrowser();
  const router = useRouter();

  const [oficinas, setOficinas] = useState([]);
  const [form, setForm] = useState({
    asunto: "",
    tipo_documento: TIPOS_DOCUMENTO[0],
    descripcion: "",
    oficina_destino_id: "",
    prioridad: "normal",
    numero_folios: 1,
  });
  const [archivo, setArchivo] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(null);

  useEffect(() => {
    supabase
      .from("oficinas")
      .select("id, nombre, codigo")
      .eq("activo", true)
      .order("orden")
      .then(({ data }) => setOficinas(data || []));
  }, []);

  function update(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let archivo_url = null;
      let archivo_nombre = null;

      if (archivo) {
        const ruta = `${user.id}/${Date.now()}-${archivo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("documentos")
          .upload(ruta, archivo);
        if (uploadError) throw uploadError;
        const { data: pub } = supabase.storage.from("documentos").getPublicUrl(ruta);
        archivo_url = pub.publicUrl;
        archivo_nombre = archivo.name;
      }

      // Mesa de Partes es el punto de entrada: todo documento nuevo cae primero ahí,
      // salvo que el remitente elija directamente la oficina destino final.
      const mesaPartes = oficinas.find((o) => o.codigo === "MESA_PARTES");

      const { data: doc, error: insertError } = await supabase
        .from("documentos")
        .insert({
          asunto: form.asunto,
          tipo_documento: form.tipo_documento,
          descripcion: form.descripcion,
          prioridad: form.prioridad,
          numero_folios: Number(form.numero_folios) || 1,
          oficina_actual_id: mesaPartes?.id || form.oficina_destino_id,
          usuario_emisor_id: user.id,
          archivo_url,
          archivo_nombre,
        })
        .select("id, codigo_expediente")
        .single();

      if (insertError) throw insertError;

      // Si el usuario indicó una oficina final distinta a Mesa de Partes,
      // se registra como la derivación inicial sugerida.
      if (form.oficina_destino_id && mesaPartes && form.oficina_destino_id !== mesaPartes.id) {
        await supabase.from("documento_historial").insert({
          documento_id: doc.id,
          estado: "recibido",
          oficina_id: mesaPartes.id,
          usuario_id: user.id,
          comentario: `Solicitó como destino: ${oficinas.find((o) => o.id === form.oficina_destino_id)?.nombre}`,
        });
      }

      setExito(doc);
    } catch (err) {
      setError(err.message || "Ocurrió un error al registrar el documento.");
    } finally {
      setCargando(false);
    }
  }

  if (exito) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card-folio p-8 text-center">
          <CheckCircle2 className="mx-auto text-salvia" size={40} />
          <h1 className="mt-4 font-display text-xl font-semibold text-tinta-950">
            Documento registrado
          </h1>
          <p className="mt-2 text-sm text-tinta-700">
            Tu código de seguimiento es:
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-tinta-950">{exito.codigo_expediente}</p>
          <p className="mt-2 text-xs text-tinta-600">
            Guárdalo para hacer seguimiento a tu trámite en cualquier momento.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => router.push(`/dashboard/documento/${exito.id}`)} className="btn-primario">
              Ver mi expediente
            </button>
            <button onClick={() => router.push("/dashboard/nuevo-documento")} className="btn-secundario">
              Enviar otro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-tinta-950">Enviar documento a la UGEL</h1>
      <p className="mt-1 text-sm text-tinta-700">
        Tu documento ingresará primero por Mesa de Partes, donde será derivado a la oficina correspondiente.
      </p>

      <form onSubmit={handleSubmit} className="card-folio mt-6 space-y-5 p-6">
        <div>
          <label className="label-legajo">Asunto</label>
          <input
            required
            className="input-legajo"
            placeholder="Ej: Solicito constancia de trabajo"
            value={form.asunto}
            onChange={(e) => update("asunto", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-legajo">Tipo de documento</label>
            <select className="input-legajo" value={form.tipo_documento} onChange={(e) => update("tipo_documento", e.target.value)}>
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-legajo">Oficina de destino sugerida</label>
            <select
              required
              className="input-legajo"
              value={form.oficina_destino_id}
              onChange={(e) => update("oficina_destino_id", e.target.value)}
            >
              <option value="">Selecciona una oficina</option>
              {oficinas.map((o) => (
                <option key={o.id} value={o.id}>{o.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label-legajo">N.º de folios</label>
            <input type="number" min={1} className="input-legajo" value={form.numero_folios} onChange={(e) => update("numero_folios", e.target.value)} />
          </div>
          <div>
            <label className="label-legajo">Prioridad</label>
            <select className="input-legajo" value={form.prioridad} onChange={(e) => update("prioridad", e.target.value)}>
              <option value="normal">Normal</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label-legajo">Descripción / detalle</label>
          <textarea
            rows={4}
            className="input-legajo resize-none"
            placeholder="Describe brevemente tu solicitud..."
            value={form.descripcion}
            onChange={(e) => update("descripcion", e.target.value)}
          />
        </div>

        <div>
          <label className="label-legajo">Archivo adjunto (PDF o imagen, opcional)</label>
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-tinta-800/30 bg-papel-200/40 px-4 py-4 text-sm text-tinta-700 hover:bg-papel-200">
            <UploadCloud size={18} />
            {archivo ? archivo.name : "Selecciona un archivo (PDF, imagen, Word, Excel, ZIP...)"}
            <input
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.zip,.rar,.7z"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md bg-sello-100 p-3 text-sm text-sello">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <button type="submit" disabled={cargando} className="btn-sello w-full">
          <Send size={16} />
          {cargando ? "Registrando..." : "Registrar documento"}
        </button>
      </form>
    </div>
  );
}
