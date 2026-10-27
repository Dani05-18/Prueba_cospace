import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <span className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-sm shadow-purple-500/20 group-hover:bg-purple-700 transition-colors">
            C
          </span>
          <span className="text-2xl font-bold tracking-tight text-slate-800">
            Co<span className="text-purple-600 font-black">Space</span>
          </span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-purple-100 rounded-2xl sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
