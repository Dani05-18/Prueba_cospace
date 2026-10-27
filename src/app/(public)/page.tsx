import { HomeHero } from "@/components/home/HomeHero";

// Estrategia exigida por la prueba: SSG (Generación estática en build)
export const dynamic = "force-static";

export default function HomePage() {
  return (
    <main className="w-full">
      <HomeHero />
    </main>
  );
}

