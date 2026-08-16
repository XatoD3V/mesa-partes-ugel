"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";
import { Building2, UserPlus, AlertCircle, CheckCircle2 } from "@/components/icons";
import Captcha from "@/components/Captcha";
import SiteLogoLink from "@/components/SiteLogoLink";

export default function RegistroPage() {
  const router = useRouter();
  const supabase = supabaseBrowser();
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    numero_documento: "",
    telefono: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  function update(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !captchaToken) {
      setError("Marca la verificación 'No soy un robot' antes de continuar.");
      return;
    }

    setCargando(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { nombres: form.nombres, apellidos: form.apellidos },
        captchaToken: captchaToken || undefined,
      },
    });

    if (signUpError) {
      setCargando(false);
      setError(
        signUpError.message.includes("already registered")
          ? "Este correo ya está registrado. Intenta iniciar sesión."
          : signUpError.message
      );
      return;
    }

    // Completa datos adicionales del perfil (el trigger ya creó la fila base)
    if (data.user) {
      await supabase
        .from("perfiles")
        .update({
          numero_documento: form.numero_documento,
          telefono: form.telefono,
        })
        .eq("id", data.user.id);
    }

    setCargando(false);

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      // Si el proyecto tiene confirmación de correo activada
      setOk(true);
    }
  }

  if (ok) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="card-folio max-w-sm p-7 text-center">
          <CheckCircle2 className="mx-auto text-salvia" size={36} />
          <h1 className="mt-3 font-display text-lg font-semibold text-tinta-950">
            Cuenta creada
          </h1>
          <p className="mt-2 text-sm text-tinta-700">
            Revisa tu correo <strong>{form.email}</strong> para confirmar tu cuenta y luego
            inicia sesión.
          </p>
          <Link href="/login" className="btn-primario mt-5 w-full">
            Ir a iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <SiteLogoLink />

        <div className="card-folio p-7">
          <h1 className="font-display text-xl font-semibold text-tinta-950">Crear cuenta</h1>
          <p className="mt-1 text-sm text-tinta-700">
            Regístrate para enviar documentos a la UGEL y hacerles seguimiento.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-legajo">Nombres</label>
                <input required className="input-legajo" value={form.nombres} onChange={(e) => update("nombres", e.target.value)} />
              </div>
              <div>
                <label className="label-legajo">Apellidos</label>
                <input required className="input-legajo" value={form.apellidos} onChange={(e) => update("apellidos", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-legajo">N.º de documento</label>
                <input required className="input-legajo" value={form.numero_documento} onChange={(e) => update("numero_documento", e.target.value)} />
              </div>
              <div>
                <label className="label-legajo">Teléfono</label>
                <input className="input-legajo" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label-legajo">Correo electrónico</label>
              <input type="email" required className="input-legajo" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <label className="label-legajo">Contraseña</label>
              <input type="password" required minLength={6} className="input-legajo" value={form.password} onChange={(e) => update("password", e.target.value)} />
            </div>

            <Captcha onVerify={setCaptchaToken} onExpire={() => setCaptchaToken("")} />

            {error && (
              <div className="flex items-start gap-2 rounded-md bg-sello-100 p-3 text-sm text-sello">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={cargando} className="btn-primario w-full">
              <UserPlus size={16} />
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-tinta-700">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-tinta-950 underline underline-offset-2">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
