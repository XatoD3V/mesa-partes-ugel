"use client";

import { useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

const FUENTES_GOOGLE = ["Roboto", "Poppins", "Merriweather", "Nunito", "Source Sans 3"];

export default function ThemeProvider() {
  useEffect(() => {
    const supabase = supabaseBrowser();

    supabase
      .from("configuracion_sitio")
      .select("*")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const root = document.documentElement;

        if (data.color_primario) root.style.setProperty("--color-brand", data.color_primario);
        if (data.color_fondo) root.style.setProperty("--color-bg", data.color_fondo);

        if (data.fuente_body && data.fuente_body !== "Inter") {
          if (FUENTES_GOOGLE.includes(data.fuente_body)) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = `https://fonts.googleapis.com/css2?family=${data.fuente_body.replace(
              / /g,
              "+"
            )}:wght@400;500;600;700&display=swap`;
            document.head.appendChild(link);
          }
          root.style.setProperty("--font-body-override", `"${data.fuente_body}"`);
        }
      });
  }, []);

  return null;
}
