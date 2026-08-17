/**
 * Devuelve la hora actual en Lima/Perú como "HH:MM" (24h), sin depender
 * de la zona horaria del navegador o del servidor donde corra el código.
 */
export function horaActualLima() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/**
 * Evalúa si, según la configuración del sitio, un usuario externo puede
 * ingresar en este momento. `config` es la fila de `configuracion_sitio`
 * (horario_activo, horario_inicio, horario_fin en formato "HH:MM[:SS]").
 * Si el horario no está activado, siempre permite el acceso.
 */
export function dentroDeHorarioExterno(config) {
  if (!config || !config.horario_activo) return true;

  const ahora = horaActualLima();
  const inicio = (config.horario_inicio || "00:00").slice(0, 5);
  const fin = (config.horario_fin || "23:59").slice(0, 5);

  if (inicio <= fin) {
    // Rango normal dentro del mismo día, ej: 08:00 - 18:00
    return ahora >= inicio && ahora <= fin;
  }
  // Rango que cruza la medianoche, ej: 22:00 - 06:00
  return ahora >= inicio || ahora <= fin;
}
