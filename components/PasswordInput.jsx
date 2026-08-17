"use client";

import { useState } from "react";
import { Eye, EyeOff } from "@/components/icons";

/**
 * Campo de contraseña con botón para mostrar/ocultar el texto.
 * Misma API que un <input>, solo agrega el ojito.
 */
export default function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={`pr-11 ${className}`}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-tinta-500 transition-colors hover:text-tinta-900"
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
