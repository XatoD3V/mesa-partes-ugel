"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Building2, LogIn, AlertCircle } from "lucide-react";

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) {
      setError(
        error.message.includes("Invalid login")
          ? "Correo o contraseña incorrectos."
          : error.message
      );
      return;
    }
    router.push(params.get("redirect") || "/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-tinta-900 text-papel-100">
            <Building2 size={18} />
          </div>
          <span className="font-display font-semibold text-tinta-950">Mesa de Partes</span>
        </Link>

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
              <input
                type="password"
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
