"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Clock } from "@/components/icons";
import SiteLogoLink from "@/components/SiteLogoLink";

export default function AccesoRestringidoPage() {
  return (
    <Suspense fallback={null}>
      <Contenido />
    </Suspense>
  );
}

function Contenido() {
  const params = useSearchParams();
  const supabase = supabaseBrowser();
  const inicio = params.get("inicio");
  const fin = params.get("fin");

  useEffect(() => {
    // Cierra la sesión: fuera de horario, un usuario externo no debe
    // quedarse con una sesión activa en el navegador.
    supabase.auth.signOut();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <SiteLogoLink />
        <div className="card-folio p-7 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ambar-100 text-ambar">
            <Clock size={26} />
          </div>
          <h1 className="mt-4 font-display text-lg font-semibold text-tinta-950">Fuera de horario de atención</h1>
          <p className="mt-2 text-sm text-tinta-700">
            {inicio && fin
              ? `El sistema solo está disponible para usuarios externos de ${inicio} a ${fin} (hora de Perú).`
              : "El sistema no está disponible para usuarios externos en este momento."}
          </p>
          <p className="mt-1 text-sm text-tinta-700">Vuelve a intentarlo dentro del horario de atención.</p>
          <Link href="/" className="btn-primario mt-5 w-full">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
