"use client";

import { FileDown } from "lucide-react";
import { ESTADOS } from "@/lib/constants";

export default function ExportarReportePDF({ total, porEstado, porOficina, nombreUgel }) {
  async function exportar() {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const fecha = new Date().toLocaleString("es-PE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    doc.setFontSize(16);
    doc.text(`Reporte de trámite documentario · ${nombreUgel}`, 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el ${fecha}`, 14, 25);
    doc.text(`Total de expedientes registrados: ${total}`, 14, 31);

    autoTable(doc, {
      startY: 38,
      head: [["Estado", "Cantidad", "% del total"]],
      body: Object.entries(ESTADOS).map(([key, val]) => [
        val.label,
        String(porEstado[key] || 0),
        total ? `${((100 * (porEstado[key] || 0)) / total).toFixed(1)}%` : "0%",
      ]),
      theme: "grid",
      headStyles: { fillColor: [21, 47, 74] },
      styles: { fontSize: 9 },
    });

    const y2 = (doc.lastAutoTable?.finalY || 38) + 10;
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text("Expedientes por oficina", 14, y2);

    autoTable(doc, {
      startY: y2 + 4,
      head: [["Oficina", "Cantidad"]],
      body: Object.entries(porOficina)
        .sort((a, b) => b[1] - a[1])
        .map(([nombre, cantidad]) => [nombre, String(cantidad)]),
      theme: "grid",
      headStyles: { fillColor: [21, 47, 74] },
      styles: { fontSize: 9 },
    });

    doc.save(`reporte-mesa-de-partes-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <button onClick={exportar} className="btn-secundario">
      <FileDown size={16} /> Exportar PDF
    </button>
  );
}
