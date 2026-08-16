// Envía un correo usando la API de Brevo (distinta del SMTP que usa Supabase Auth).
// Solo se ejecuta en el servidor: usa BREVO_API_KEY, una clave secreta.
export async function enviarCorreoBrevo({ to, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.NEXT_PUBLIC_NOMBRE_UGEL || "Mesa de Partes UGEL";

  // Si aún no se configuraron las claves de Brevo, no rompe el flujo: simplemente no envía.
  if (!apiKey || !senderEmail) {
    return { skipped: true };
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const detalle = await res.text();
    throw new Error(`Brevo respondió con error ${res.status}: ${detalle}`);
  }

  return res.json();
}
