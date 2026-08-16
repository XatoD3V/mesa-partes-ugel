"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { ROLES, iniciales } from "@/lib/constants";
import {
  LayoutDashboard,
  FileText,
  Inbox,
  Building2,
  Users,
  BarChart3,
  LogOut,
  FolderClock,
  Settings,
} from "lucide-react";

export default function Sidebar({ perfil, onNavigate, logoUrl }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const esExterno = perfil.rol === "externo";
  const esPersonalUgel = ["mesa_partes", "jefe_oficina", "admin"].includes(perfil.rol);
  const esAdmin = perfil.rol === "admin";

  const links = [
    { href: "/dashboard", label: "Inicio", icon: LayoutDashboard, show: true },
    { href: "/dashboard/nuevo-documento", label: "Enviar documento", icon: FileText, show: esExterno },
    { href: "/dashboard/mis-documentos", label: "Mis documentos", icon: FolderClock, show: esExterno },
    { href: "/dashboard/bandeja", label: "Bandeja de trámites", icon: Inbox, show: esPersonalUgel },
    { href: "/dashboard/reportes", label: "Reportes", icon: BarChart3, show: esPersonalUgel },
    { href: "/dashboard/oficinas", label: "Oficinas", icon: Building2, show: esAdmin },
    { href: "/dashboard/usuarios", label: "Usuarios", icon: Users, show: esAdmin },
    { href: "/dashboard/configuracion", label: "Configuración", icon: Settings, show: esAdmin },
  ];

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-tinta-900/10 bg-papel-100">
      <div className="flex items-center gap-2.5 px-5 py-5">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="h-9 w-9 shrink-0 rounded-md object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-tinta-900 text-papel-100">
            <Building2 size={18} />
          </div>
        )}
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold text-tinta-950">Mesa de Partes</p>
          <p className="text-[11px] text-tinta-600">{process.env.NEXT_PUBLIC_NOMBRE_UGEL || "UGEL"}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {links
          .filter((l) => l.show)
          .map((l) => {
            const activo = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  activo
                    ? "bg-tinta-900 text-papel-100"
                    : "text-tinta-800 hover:bg-tinta-100"
                }`}
              >
                <l.icon size={17} />
                {l.label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-tinta-900/10 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-tinta-800 text-xs font-semibold text-papel-100">
            {iniciales(perfil.nombres, perfil.apellidos)}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-tinta-950">
              {perfil.nombres} {perfil.apellidos}
            </p>
            <p className="truncate text-xs text-tinta-600">{ROLES[perfil.rol]}</p>
          </div>
        </div>
        <button
          onClick={cerrarSesion}
          className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-tinta-700 hover:bg-tinta-100"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
