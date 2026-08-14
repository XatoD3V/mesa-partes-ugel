import { ESTADOS } from "@/lib/constants";

export default function EstadoBadge({ estado }) {
  const e = ESTADOS[estado] || ESTADOS.recibido;
  return (
    <span className={`badge ${e.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${e.dot}`} />
      {e.label}
    </span>
  );
}
