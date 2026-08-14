export const ESTADOS = {
  recibido: { label: "Recibido", color: "bg-tinta-100 text-tinta-800", dot: "bg-tinta-600" },
  derivado: { label: "Derivado", color: "bg-ambar-100 text-ambar", dot: "bg-ambar" },
  en_proceso: { label: "En proceso", color: "bg-ambar-100 text-ambar", dot: "bg-ambar" },
  observado: { label: "Observado", color: "bg-sello-100 text-sello", dot: "bg-sello" },
  atendido: { label: "Atendido", color: "bg-salvia-100 text-salvia", dot: "bg-salvia" },
  archivado: { label: "Archivado", color: "bg-papel-300 text-tinta-700", dot: "bg-tinta-500" },
};

export const TIPOS_DOCUMENTO = [
  "Solicitud",
  "Oficio",
  "Carta",
  "Memorando",
  "Informe",
  "Expediente",
  "Queja / Reclamo",
  "Constancia",
  "Resolución",
  "Otro",
];

export const ROLES = {
  externo: "Usuario externo",
  mesa_partes: "Mesa de Partes",
  jefe_oficina: "Jefe de Oficina",
  admin: "Administrador",
};

export function iniciales(nombres = "", apellidos = "") {
  return `${nombres?.[0] ?? ""}${apellidos?.[0] ?? ""}`.toUpperCase();
}

export function formatoFecha(fecha) {
  try {
    return new Date(fecha).toLocaleString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fecha;
  }
}
