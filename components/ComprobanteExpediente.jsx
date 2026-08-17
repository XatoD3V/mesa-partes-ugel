"use client";

import { FileDown } from "@/components/icons";

/**
 * Genera el comprobante de recepción de un expediente y abre el diálogo
 * de impresión del navegador. `datos` debe traer:
 * codigo_expediente, asunto, tipo_documento, prioridad, numero_folios,
 * created_at, oficina_nombre, emisor_nombre, emisor_documento, nombreUgel.
 */
async function construirPDF(datos) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  const fechaObj = new Date(datos.created_at || Date.now());
  const fecha = fechaObj.toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  const hora = fechaObj.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

  // Encabezado
  doc.setFontSize(13);
  doc.setTextColor(21, 47, 74);
  doc.text(datos.nombreUgel || "UGEL", 14, 18);
  doc.setFontSize(16);
  doc.text("Comprobante de recepción de documento", 14, 27);
  doc.setDrawColor(21, 47, 74);
  doc.line(14, 31, 196, 31);

  // Código de expediente, destacado
  doc.setFontSize(11);
  doc.setTextColor(90, 90, 90);
  doc.text("Código de expediente", 14, 41);
  doc.setFontSize(20);
  doc.setTextColor(178, 58, 46);
  doc.text(datos.codigo_expediente, 14, 50);

  // Detalle en filas etiqueta/valor
  const filas = [
    ["Asunto", datos.asunto],
    ["Tipo de documento", datos.tipo_documento],
    ["Prioridad", datos.prioridad === "urgente" ? "Urgente" : "Normal"],
    ["N.º de folios", String(datos.numero_folios || 1)],
    ["Oficina de destino", datos.oficina_nombre || "Mesa de Partes"],
    ["Presentado por", datos.emisor_nombre],
    ["N.º de documento", datos.emisor_documento || "—"],
    ["Fecha de registro", fecha],
    ["Hora de registro", hora],
  ];

  let y = 63;
  doc.setFontSize(10.5);
  filas.forEach(([etiqueta, valor]) => {
    doc.setTextColor(90, 90, 90);
    doc.text(`${etiqueta}:`, 14, y);
    doc.setTextColor(20, 20, 20);
    doc.text(String(valor || "—"), 65, y, { maxWidth: 130 });
    y += 9;
  });

  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, 196, y);
  y += 8;
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Conserva este comprobante. Puedes hacer seguimiento a tu trámite con el código de expediente,",
    14,
    y
  );
  doc.text("con o sin iniciar sesión, desde la opción \"Consultar un expediente\".", 14, y + 5);
  doc.text(`Generado el ${fecha}, ${hora} (hora de Perú).`, 14, y + 13);

  return doc;
}

export async function imprimirComprobante(datos) {
  const doc = await construirPDF(datos);
  doc.autoPrint();
  window.open(doc.output("bloburl"), "_blank");
}

export async function descargarComprobante(datos) {
  const doc = await construirPDF(datos);
  doc.save(`comprobante-${datos.codigo_expediente}.pdf`);
}

export default function BotonComprobante({ datos, className = "btn-secundario" }) {
  return (
    <button type="button" onClick={() => imprimirComprobante(datos)} className={className}>
      <FileDown size={16} /> Imprimir comprobante
    </button>
  );
}
