import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboard && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isDashboard && user) {
    const [{ data: perfil }, { data: config }] = await Promise.all([
      supabase.from("perfiles").select("rol").eq("id", user.id).single(),
      supabase.from("configuracion_sitio").select("horario_activo, horario_inicio, horario_fin").eq("id", 1).single(),
    ]);

    if (perfil?.rol === "externo" && config?.horario_activo) {
      const ahora = new Intl.DateTimeFormat("en-GB", {
        timeZone: "America/Lima",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(new Date());
      const inicio = (config.horario_inicio || "00:00").slice(0, 5);
      const fin = (config.horario_fin || "23:59").slice(0, 5);
      const dentro = inicio <= fin ? ahora >= inicio && ahora <= fin : ahora >= inicio || ahora <= fin;

      if (!dentro) {
        const url = request.nextUrl.clone();
        url.pathname = "/acceso-restringido";
        url.searchParams.set("inicio", inicio);
        url.searchParams.set("fin", fin);
        return NextResponse.redirect(url);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
