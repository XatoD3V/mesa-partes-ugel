"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "@/components/icons";
import Sidebar from "@/components/Sidebar";
import NotificacionesBell from "@/components/NotificacionesBell";

export default function DashboardShell({ perfil, userId, logoUrl, children }) {
  const [abierto, setAbierto] = useState(false);
  const pathname = usePathname();

  // Cierra el menú automáticamente al cambiar de página (útil en móvil)
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-papel">
      {/* Fondo oscuro al abrir el menú en móvil */}
      {abierto && (
        <div className="fixed inset-0 z-30 bg-tinta-950/40 md:hidden" onClick={() => setAbierto(false)} />
      )}

      {/* Menú lateral: fijo en escritorio, deslizable en móvil/tablet */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          abierto ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar perfil={perfil} onNavigate={() => setAbierto(false)} logoUrl={logoUrl} />
      </div>

      <div className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-white/50 bg-papel-100/60 px-4 backdrop-blur-xl sm:px-6">
          <button
            onClick={() => setAbierto((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-tinta-800 hover:bg-tinta-100 md:hidden"
            aria-label="Abrir menú"
          >
            {abierto ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1" />
          <NotificacionesBell userId={userId} />
        </header>
        <main className="p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
