import Link from "next/link";
import { FileText, Search, ShieldCheck, Building2, ArrowRight, Clock, Users, Megaphone, MessageCircle } from "@/components/icons";
import { supabaseServer } from "@/lib/supabaseServer";

const nombreUgel = process.env.NEXT_PUBLIC_NOMBRE_UGEL || "UGEL";

export default async function Home() {
  const supabase = supabaseServer();
  const { data: avisos } = await supabase
    .from("avisos")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false });
  const { data: config } = await supabase.from("configuracion_sitio").select("favicon_url").eq("id", 1).single();
  const logoUrl = config?.favicon_url || null;

  return (
    <main className="min-h-screen">
      {/* Avisos / banners publicados por el administrador */}
      {(avisos || []).map((a) => (
        <div
          key={a.id}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 text-center text-sm font-medium ${
            a.tipo === "urgente" ? "bg-sello text-papel-100" : "bg-tinta-900 text-papel-100"
          }`}
        >
          <Megaphone size={15} className="shrink-0" />
          <span>{a.mensaje}</span>
        </div>
      ))}

      {/* Encabezado */}
      <header className="border-b border-tinta-900/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-md object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-tinta-900 text-papel-100">
                <Building2 size={20} />
              </div>
            )}
            <div className="leading-tight">
              <p className="font-display text-base font-semibold text-tinta-950">{nombreUgel}</p>
              <p className="text-xs text-tinta-700">Mesa de Partes Virtual</p>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/consulta" className="hidden text-sm font-medium text-tinta-800 hover:text-tinta-950 sm:block">
              Consultar expediente
            </Link>
            <Link href="/login" className="btn-secundario !py-2 text-sm">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="btn-primario !py-2 text-sm">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="badge bg-sello-100 text-sello">
              <span className="h-1.5 w-1.5 rounded-full bg-sello" />
              Trámite 100% en línea
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] text-tinta-950 sm:text-5xl">
              Presenta y sigue tus documentos ante la UNIDADES DE GESTION EDUCATIVA LOCAL - LORETO - NAUTA.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-tinta-800">
              Registra tu solicitud, oficio o expediente, adjunta tus archivos y recibe un
              código de seguimiento único. La oficina de <strong>Recursos Humanos</strong> y todas
              las demás áreas de la UGEL reciben, derivan y atienden tu trámite con trazabilidad
              completa, en tiempo real.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/registro" className="btn-sello">
                <FileText size={18} />
                Enviar un documento
                <ArrowRight size={16} />
              </Link>
              <Link href="/consulta" className="btn-secundario">
                <Search size={18} />
                Consultar mi expediente
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-tinta-900/10 pt-6">
              <div>
                <p className="font-display text-2xl font-semibold text-tinta-950">12+</p>
                <p className="text-xs text-tinta-700">Oficinas conectadas</p>
              </div>
              <div>
                <p className="font-display text-3x1 font-semibold text-tinta-950">24 Hrs</p>
                <p className="text-xs text-tinta-700">Registro de documentos</p>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold text-tinta-950">Verifica</p>
                <p className="text-xs text-tinta-700">Seguimiento de documentos en Tiempo Real</p>
              </div>
            </div>
          </div>

          {/* Tarjeta ilustrativa de expediente */}
          <div className="card-folio relative mx-auto w-full max-w-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-tinta-600">Expediente - Ejemplo</p>
                <p className="font-mono text-lg font-semibold text-tinta-950">EXP-2026-004821</p>
              </div>
              <span className="badge bg-ambar-100 text-ambar">
                <span className="h-1.5 w-1.5 rounded-full bg-ambar" />
                En proceso
              </span>
            </div>
            <p className="mt-4 text-sm text-tinta-800">
              Solicitud de constancia de trabajo — derivado a{" "}
              <strong>Recursos Humanos</strong>
            </p>
            <ol className="mt-5 space-y-4 border-l-2 border-papel-300 pl-4">
              <li className="relative text-sm">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-salvia" />
                <p className="font-medium text-tinta-950">Recibido en Mesa de Partes</p>
                <p className="text-xs text-tinta-600">03 ago · 08:12 a. m.</p>
              </li>
              <li className="relative text-sm">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-salvia" />
                <p className="font-medium text-tinta-950">Derivado a Recursos Humanos</p>
                <p className="text-xs text-tinta-600">03 ago · 09:40 a. m.</p>
              </li>
              <li className="relative text-sm opacity-60">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-ambar" />
                <p className="font-medium text-tinta-950">En atención</p>
                <p className="text-xs text-tinta-600">En curso</p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-y border-tinta-900/10 bg-papel-100/60">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl font-semibold text-tinta-950">Cómo funciona</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: FileText,
                titulo: "1. Registras tu documento",
                texto:
                  "Completas el formulario, eliges la oficina destino y adjuntas tu archivo (PDF, imagen).",
              },
              {
                icon: Users,
                titulo: "2. La UGEL lo deriva",
                texto:
                  "Mesa de Partes recibe y deriva a la oficina correspondiente: RRHH y demás áreas.",
              },
              {
                icon: Clock,
                titulo: "3. Sigues el avance",
                texto:
                  "Consultas el estado con tu código de expediente, en tiempo real, sin llamar por teléfono.",
              },
            ].map((p) => (
              <div key={p.titulo} className="card-folio p-5">
                <p.icon className="text-sello" size={22} />
                <p className="mt-3 font-display text-base font-semibold text-tinta-950">{p.titulo}</p>
                <p className="mt-1.5 text-sm text-tinta-700">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confianza */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-tinta-900/10 bg-tinta-950 p-8 text-papel-100 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-salvia" />
            <div>
              <p className="font-display text-lg font-semibold">Trazabilidad garantizada</p>
              <p className="text-sm text-papel-100/70">
                Cada movimiento de tu expediente queda registrado con fecha, hora, oficina y responsable.
              </p>
            </div>
          </div>
          <Link href="/registro" className="btn-primario !bg-papel-100 !text-tinta-950 hover:!bg-papel-200">
            Empezar ahora
          </Link>
        </div>
      </section>

      <footer className="border-t border-tinta-900/10 py-8 text-center">
        <p className="text-xs text-tinta-600">
          Mesa de Partes Virtual · {nombreUgel} · Sistema de gestión documentaria
        </p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-tinta-600">
          Desarrollado por <strong className="text-tinta-800">Xato D3v</strong>
          <a
            href="https://wa.me/51914473392"
            target="_blank"
            rel="noreferrer"
            className="ml-1 inline-flex items-center gap-1 text-salvia hover:underline"
          >
            <MessageCircle size={13} /> +51 914 473 392
          </a>
        </p>
      </footer>
    </main>
  );
}
