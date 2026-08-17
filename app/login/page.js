"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Building2, LogIn, AlertCircle } from "@/components/icons";
import SiteLogoLink from "@/components/SiteLogoLink";
import PasswordInput from "@/components/PasswordInput";
import { dentroDeHorarioExterno } from "@/lib/horario";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = supabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setCargando(false);
      setError(
        error.message.includes("Invalid login")
          ? "Correo o contraseña incorrectos."
          : error.message
      );
      return;
    }

    // Si es un usuario externo, valida que esté dentro del horario permitido
    // antes de dejarlo entrar (el personal de la UGEL no tiene esta restricción).
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const [{ data: perfil }, { data: config }] = await Promise.all([
      supabase.from("perfiles").select("rol").eq("id", user.id).single(),
      supabase.from("configuracion_sitio").select("horario_activo, horario_inicio, horario_fin").eq("id", 1).single(),
    ]);

    if (perfil?.rol === "externo" && !dentroDeHorarioExterno(config)) {
      await supabase.auth.signOut();
      setCargando(false);
      const ini = (config.horario_inicio || "").slice(0, 5);
      const fin = (config.horario_fin || "").slice(0, 5);
      setError(`El sistema solo está disponible para usuarios externos de ${ini} a ${fin} (hora de Perú). Intenta más tarde.`);
      return;
    }

    setCargando(false);
    router.push(params.get("redirect") || "/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <SiteLogoLink />

        <div className="card-folio p-7">
          <h1 className="font-display text-xl font-semibold text-tinta-950">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-tinta-700">Accede para enviar y hacer seguimiento a tus documentos.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label-legajo">Correo electrónico</label>
              <input
                type="email"
                required
                className="input-legajo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
            <div>
              <label className="label-legajo">Contraseña</label>
              <PasswordInput
                required
                className="input-legajo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-sello-100 p-3 text-sm text-sello">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={cargando} className="btn-primario w-full">
              <LogIn size={16} />
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-tinta-700">
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-tinta-950 underline underline-offset-2">
            Regístrate aquí
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/consulta" className="text-tinta-700 underline underline-offset-2">
            Consultar un expediente sin iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
