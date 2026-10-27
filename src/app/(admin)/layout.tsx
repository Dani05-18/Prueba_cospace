import React from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <Navbar />
      <div className="bg-purple-700 text-white text-xs font-bold py-1.5 px-4 text-center tracking-wide shadow-xs">
        🛡️ ENTORNO ADMINISTRATIVO • GESTIÓN DE ESPACIOS COSPACE
      </div>
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
      <Footer />
    </div>
  );
}
