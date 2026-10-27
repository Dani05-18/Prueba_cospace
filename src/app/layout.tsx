import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";

export const metadata: Metadata = {
  title: "CoSpace - Reserva de Espacios de Coworking",
  description: "Plataforma de reservas de escritorios, salas y cabinas por horas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-[#FDFBF7] text-slate-800">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
