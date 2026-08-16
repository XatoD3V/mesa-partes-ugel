"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export default function Captcha({ onVerify, onExpire }) {
  const ref = useRef(null);
  const widgetId = useRef(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  function render() {
    if (!window.turnstile || !ref.current || widgetId.current) return;
    widgetId.current = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      callback: onVerify,
      "expired-callback": onExpire,
      theme: "light",
    });
  }

  useEffect(() => {
    if (window.turnstile) render();
    return () => {
      if (window.turnstile && widgetId.current) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);

  if (!siteKey) return null; // Si aún no se configuró la clave, no bloquea el registro

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer onLoad={render} />
      <div ref={ref} />
    </>
  );
}
