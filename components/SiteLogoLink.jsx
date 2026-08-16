"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2 } from "@/components/icons";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function SiteLogoLink() {
  const [logoUrl, setLogoUrl] = useState(null);

  useEffect(() => {
    const supabase = supabaseBrowser();
    supabase
      .from("configuracion_sitio")
      .select("favicon_url")
      .eq("id", 1)
      .single()
      .then(({ data }) => setLogoUrl(data?.favicon_url || null));
  }, []);

  return (
    <Link href="/" className="mb-8 flex items-center justify-center gap-2">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="Logo" className="h-9 w-9 rounded-md object-cover" />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-tinta-900 text-papel-100">
          <Building2 size={18} />
        </div>
      )}
      <span className="font-display font-semibold text-tinta-950">Mesa de Partes</span>
    </Link>
  );
}
