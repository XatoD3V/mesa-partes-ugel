import { Lora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const display = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600"],
});

const nombreUgel = process.env.NEXT_PUBLIC_NOMBRE_UGEL || "UGEL";

export const metadata = {
  title: `Mesa de Partes Virtual · ${nombreUgel}`,
  description:
    "Sistema de Mesa de Partes Virtual: presenta, deriva y realiza seguimiento de tus documentos ante la UGEL en línea.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${body.variable} ${mono.variable} bg-papel`}>
        <ThemeProvider />
        {/* Fondo ambiental: manchas de luz suaves que le dan vida sin distraer */}
        <div className="ambiente">
          <span className="left-[-10%] top-[-15%] h-[32rem] w-[32rem] animate-float-slow bg-tinta-500" />
          <span className="right-[-12%] top-[10%] h-[26rem] w-[26rem] animate-float bg-sello" />
          <span className="bottom-[-15%] left-[20%] h-[28rem] w-[28rem] animate-float-slow bg-salvia" />
        </div>
        {children}
      </body>
    </html>
  );
}
