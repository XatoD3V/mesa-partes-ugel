"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { formatoFecha } from "@/lib/constants";
import { Bell } from "lucide-react";

export default function NotificacionesBell({ userId }) {
  const supabase = supabaseBrowser();
  const [abierto, setAbierto] = useState(false);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const { data } = await supabase
        .from("notificaciones")
        .select("*")
        .eq("usuario_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (activo) setNotifs(data || []);
    }
    cargar();

    const canal = supabase
      .channel("notificaciones-" + userId)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificaciones", filter: `usuario_id=eq.${userId}` },
        (payload) => setNotifs((prev) => [payload.new, ...prev])
      )
      .subscribe();

    return () => {
      activo = false;
      supabase.removeChannel(canal);
    };
  }, [userId]);

  const noLeidas = notifs.filter((n) => !n.leido).length;

  async function marcarLeidas() {
    setAbierto((v) => !v);
    if (noLeidas > 0) {
      const ids = notifs.filter((n) => !n.leido).map((n) => n.id);
      await supabase.from("notificaciones").update({ leido: true }).in("id", ids);
      setNotifs((prev) => prev.map((n) => ({ ...n, leido: true })));
    }
  }

  return (
    <div className="relative">
      <button
        onClick={marcarLeidas}
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-tinta-800 hover:bg-tinta-100"
      >
        <Bell size={18} />
        {noLeidas > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-sello text-[10px] font-bold text-papel-100">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>
      {abierto && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-papel-300 bg-papel-100 shadow-folio">
          <div className="border-b border-papel-300 px-4 py-3">
            <p className="text-sm font-semibold text-tinta-950">Notificaciones</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-tinta-600">Sin notificaciones</p>
            )}
            {notifs.map((n) => (
              <div key={n.id} className="border-b border-papel-300 px-4 py-3 last:border-0">
                <p className="text-sm text-tinta-900">{n.mensaje}</p>
                <p className="mt-1 text-xs text-tinta-600">{formatoFecha(n.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
